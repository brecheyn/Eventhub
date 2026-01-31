'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Loading from '@/components/ui/Loading';
import { eventsAPI } from '@/lib/api/events';
import { Calendar, Users, MapPin, Plus, Search, Filter, TrendingUp } from 'lucide-react';
import Link from 'next/link';
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
      setEvents(allEvents);
      setFilteredEvents(allEvents);
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
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      'published': 'badge-success',
      'draft': 'badge-warning',
      'ongoing': 'badge-info',
      'completed': 'badge-orange',
      'cancelled': 'badge-danger',
    };
    return badges[status] || 'badge-info';
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      'published': 'Publié',
      'draft': 'Brouillon',
      'ongoing': 'En cours',
      'completed': 'Terminé',
      'cancelled': 'Annulé',
    };
    return labels[status] || status;
  };

  if (authLoading || loading) return <Loading />;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-secondary-50/50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 flex items-center">
              <Calendar className="h-8 w-8 mr-3 text-primary-600" />
              Mes Événements
            </h1>
            <p className="mt-2 text-secondary-600">
              Gérez tous vos événements en un seul endroit
            </p>
          </div>
          
          {(user?.role === 'admin' || user?.role === 'organizer') && (
            <Link href="/events/new" className="btn-primary inline-flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Nouvel événement
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
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

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field pl-10"
              >
                <option value="all">Tous les statuts</option>
                <option value="published">Publié</option>
                <option value="draft">Brouillon</option>
                <option value="ongoing">En cours</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border-2 border-secondary-100 rounded-lg p-4">
            <div className="text-sm text-secondary-600">Total</div>
            <div className="text-2xl font-bold text-secondary-900">{events.length}</div>
          </div>
          <div className="bg-white border-2 border-green-100 rounded-lg p-4">
            <div className="text-sm text-green-600">Publiés</div>
            <div className="text-2xl font-bold text-green-700">
              {events.filter(e => e.status === 'published').length}
            </div>
          </div>
          <div className="bg-white border-2 border-blue-100 rounded-lg p-4">
            <div className="text-sm text-blue-600">Participants</div>
            <div className="text-2xl font-bold text-blue-700">
              {events.reduce((sum, e) => sum + e.currentCapacity, 0)}
            </div>
          </div>
          <div className="bg-white border-2 border-primary-100 rounded-lg p-4">
            <div className="text-sm text-primary-600">Taux remplissage</div>
            <div className="text-2xl font-bold text-primary-700">
              {events.length > 0 
                ? Math.round((events.reduce((sum, e) => sum + e.currentCapacity, 0) / 
                    events.reduce((sum, e) => sum + e.maxCapacity, 0)) * 100)
                : 0}%
            </div>
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
                : 'Commencez par créer votre premier événement'}
            </p>
            {!searchTerm && statusFilter === 'all' && (user?.role === 'admin' || user?.role === 'organizer') && (
              <Link href="/events/new" className="btn-primary inline-flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Créer un événement
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="card group hover:border-primary-300 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`badge ${getStatusBadge(event.status)}`}>
                    {getStatusLabel(event.status)}
                  </span>
                  {event.isFree && (
                    <span className="badge badge-success">
                      Gratuit
                    </span>
                  )}
                </div>

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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
