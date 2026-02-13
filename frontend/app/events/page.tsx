'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Loading from '@/components/ui/Loading';
import { eventsAPI } from '@/lib/api/events';
import { canViewEvent, getEventActualStatus } from '@/lib/utils/permissions';
import { Calendar, Users, MapPin, Plus, Search, Filter, TrendingUp, CheckCircle, Clock, Lock, User, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function EventsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterEvents();
  }, [searchTerm, statusFilter, events]);

  const loadEvents = async () => {
    try {
      const { events: allEvents } = await eventsAPI.getAll();
      
      // Filtrer selon les permissions
      const visibleEvents = allEvents.filter((event: any) => 
        canViewEvent(user, event)
      );
      
      setEvents(visibleEvents);
      setFilteredEvents(visibleEvents);
    } catch (error) {
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => {
        const actualStatus = getEventActualStatus(event);
        return actualStatus === statusFilter;
      });
    }

    setFilteredEvents(filtered);
  };

  const getStatusBadge = (event: any) => {
    const status = getEventActualStatus(event);
    const badges: any = {
      'published': { class: 'badge-info', label: 'À venir', icon: Calendar },
      'draft': { class: 'badge-warning', label: 'Brouillon', icon: null },
      'ongoing': { class: 'badge-success', label: 'En cours', icon: Clock },
      'completed': { class: 'badge-orange', label: 'Terminé', icon: CheckCircle },
      'cancelled': { class: 'badge-danger', label: 'Annulé', icon: null },
    };
    return badges[status] || badges.published;
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${apiUrl}${imageUrl}`;
  };

  if (authLoading || loading) return <Loading />;
  if (!isAuthenticated) return null;

  const stats = {
    total: events.length,
    published: events.filter(e => getEventActualStatus(e) === 'published').length,
    ongoing: events.filter(e => getEventActualStatus(e) === 'ongoing').length,
    completed: events.filter(e => getEventActualStatus(e) === 'completed').length,
    participants: events.reduce((sum, e) => sum + e.currentCapacity, 0),
  };

  // Afficher le bouton "Créer" seulement pour Admin/Organizer
  const canCreateEvent = user?.role === 'admin' || user?.role === 'organizer';

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-secondary-50/50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 flex items-center">
              <Calendar className="h-8 w-8 mr-3 text-primary-600" />
              Événements
            </h1>
            <p className="mt-2 text-secondary-600">
              {user?.role === 'admin' 
                ? 'Tous les événements de la plateforme' 
                : user?.role === 'organizer'
                ? 'Vos événements et événements publics'
                : 'Découvrez et participez aux événements'}
            </p>
          </div>
          
          {canCreateEvent && (
            <Link href="/events/new" className="btn-primary inline-flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Nouvel événement
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
              <input
                type="text"
                placeholder="Rechercher par titre ou lieu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field pl-10"
              >
                <option value="all">Tous les statuts</option>
                <option value="published">À venir</option>
                <option value="ongoing">En cours</option>
                <option value="completed">Terminés</option>
                {user?.role !== 'participant' && (
                  <>
                    <option value="draft">Brouillons</option>
                    <option value="cancelled">Annulés</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white border-2 border-secondary-100 rounded-lg p-4">
            <div className="text-sm text-secondary-600">Total</div>
            <div className="text-2xl font-bold text-secondary-900">{stats.total}</div>
          </div>
          <div className="bg-white border-2 border-blue-100 rounded-lg p-4">
            <div className="text-sm text-blue-600">À venir</div>
            <div className="text-2xl font-bold text-blue-700">{stats.published}</div>
          </div>
          <div className="bg-white border-2 border-green-100 rounded-lg p-4">
            <div className="text-sm text-green-600">En cours</div>
            <div className="text-2xl font-bold text-green-700">{stats.ongoing}</div>
          </div>
          <div className="bg-white border-2 border-orange-100 rounded-lg p-4">
            <div className="text-sm text-orange-600">Terminés</div>
            <div className="text-2xl font-bold text-orange-700">{stats.completed}</div>
          </div>
          <div className="bg-white border-2 border-primary-100 rounded-lg p-4">
            <div className="text-sm text-primary-600">Participants</div>
            <div className="text-2xl font-bold text-primary-700">{stats.participants}</div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="card text-center py-16">
            <Calendar className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'Aucun événement trouvé' 
                : 'Aucun événement pour le moment'}
            </h3>
            <p className="text-secondary-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Essayez de modifier vos filtres'
                : canCreateEvent 
                ? 'Commencez par créer votre premier événement'
                : 'Revenez plus tard pour découvrir de nouveaux événements'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const statusBadge = getStatusBadge(event);
              const StatusIcon = statusBadge.icon;
              const isCompleted = getEventActualStatus(event) === 'completed';
              const isOwnEvent = user?.role === 'organizer' && event.organizerId === user.id;
              const imageUrl = getImageUrl(event.imageUrl);
              
              return (
                <div
                  key={event.id}
                  className={`card group hover:border-primary-300 hover:shadow-lg transition-all cursor-pointer overflow-hidden p-0 ${
                    isCompleted ? 'opacity-75' : ''
                  }`}
                  onClick={() => router.push(`/events/${event.id}`)}
                >
                  {/* Image de l'événement */}
                  <div className="relative h-48 bg-gradient-to-br from-primary-500 to-primary-600">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          // Si l'image ne charge pas, afficher le placeholder
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-16 w-16 text-white/30" />
                      </div>
                    )}
                    
                    {/* Badges par-dessus l'image */}
                    <div className="absolute top-3 left-3 right-3 flex gap-2 flex-wrap">
                      <span className={`badge ${statusBadge.class} inline-flex items-center backdrop-blur-sm`}>
                        {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                        {statusBadge.label}
                      </span>
                      {event.isFree && (
                        <span className="badge badge-success backdrop-blur-sm">Gratuit</span>
                      )}
                      {isOwnEvent && (
                        <span className="badge badge-info backdrop-blur-sm">
                          <User className="h-3 w-3 mr-1" />
                          Vôtre
                        </span>
                      )}
                      {isCompleted && (
                        <span className="badge badge-orange backdrop-blur-sm">
                          <Lock className="h-3 w-3 mr-1" />
                          Clôturé
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contenu de la carte */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-sm text-secondary-600 mb-4 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm text-secondary-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary-500" />
                        {format(new Date(event.startDate), 'dd MMMM yyyy', { locale: fr })}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-primary-500" />
                        {event.currentCapacity}/{event.maxCapacity} participants
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-secondary-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                          <span className="text-secondary-600">
                            {event.maxCapacity > 0 
                              ? Math.round((event.currentCapacity / event.maxCapacity) * 100)
                              : 0}% rempli
                          </span>
                        </div>
                        <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                          Voir détails →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}