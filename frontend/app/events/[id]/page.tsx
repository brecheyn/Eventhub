'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Loading from '@/components/ui/Loading';
import { eventsAPI } from '@/lib/api/events';
import { ticketsAPI } from '@/lib/api/tickets';
import { sessionsAPI } from '@/lib/api/sessions';
import { Calendar, MapPin, Users, DollarSign, Edit, Trash2, ArrowLeft, Plus, Clock, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function EventDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasTicket, setHasTicket] = useState(false);

  useEffect(() => {
    loadEventDetails();
    loadSessions();
    checkUserTicket();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      const { event: eventData } = await eventsAPI.getById(eventId);
      setEvent(eventData);
      
      if (user?.role === 'admin' || user?.role === 'organizer') {
        const { tickets } = await eventsAPI.getParticipants(eventId);
        setParticipants(tickets);
      }
    } catch (error) {
      toast.error('Événement introuvable');
      router.push('/events');
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const { sessions: sessionsData } = await sessionsAPI.getByEvent(eventId);
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const checkUserTicket = async () => {
    try {
      const { tickets } = await ticketsAPI.getMyTickets();
      const userTicket = tickets.find((t: any) => t.eventId === eventId);
      setHasTicket(!!userTicket);
    } catch (error) {
      console.error('Error checking ticket:', error);
    }
  };

  const handleRegister = async () => {
    try {
      await ticketsAPI.create(eventId);
      toast.success('Inscription réussie ! 🎉');
      setHasTicket(true);
      loadEventDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

    try {
      await eventsAPI.delete(eventId);
      toast.success('Événement supprimé');
      router.push('/events');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) return <Loading />;
  if (!event) return null;

  const canEdit = user?.role === 'admin' || event.organizerId === user?.id;
  const canRegister = event.status === 'published' && 
                      event.currentCapacity < event.maxCapacity && 
                      !hasTicket;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-secondary-50/50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Link href="/events" className="inline-flex items-center text-secondary-600 hover:text-primary-600 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux événements
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="card">
              <div className="flex justify-between items-start mb-4">
                <span className={`badge ${getStatusBadge(event.status)}`}>
                  {event.status}
                </span>
                {canEdit && (
                  <div className="flex space-x-2">
                    <Link
                      href={`/events/${eventId}/edit`}
                      className="btn-secondary text-sm inline-flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="btn-danger text-sm inline-flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>

              <h1 className="text-3xl font-bold text-secondary-900 mb-4">
                {event.title}
              </h1>

              {event.description && (
                <p className="text-secondary-600 leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>

            {/* Details */}
            <div className="card">
              <h2 className="text-xl font-bold text-secondary-900 mb-6">
                Informations
              </h2>

              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                  <div>
                    <div className="font-medium text-secondary-900">Date</div>
                    <div className="text-secondary-600">
                      Du {format(new Date(event.startDate), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      <br />
                      au {format(new Date(event.endDate), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                  <div>
                    <div className="font-medium text-secondary-900">Lieu</div>
                    <div className="text-secondary-600">
                      {event.location}
                      {event.venue && <><br />{event.venue}</>}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Users className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                  <div>
                    <div className="font-medium text-secondary-900">Participants</div>
                    <div className="text-secondary-600">
                      {event.currentCapacity} / {event.maxCapacity} inscrits
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                  <div>
                    <div className="font-medium text-secondary-900">Tarif</div>
                    <div className="text-secondary-600">
                      {event.isFree ? 'Gratuit' : `${event.ticketPrice} €`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sessions */}
            {sessions.length > 0 && (
              <div className="card">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-secondary-900">
                    Programme ({sessions.length} sessions)
                  </h2>
                  {canEdit && (
                    <Link
                      href={`/events/${eventId}/sessions/new`}
                      className="btn-secondary text-sm inline-flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Link>
                  )}
                </div>

                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="border-2 border-secondary-100 rounded-lg p-4 hover:border-primary-300 transition-colors"
                    >
                      <h3 className="font-semibold text-secondary-900 mb-2">
                        {session.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-secondary-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-primary-500" />
                          {format(new Date(session.startTime), 'HH:mm', { locale: fr })} - 
                          {format(new Date(session.endTime), 'HH:mm', { locale: fr })}
                        </div>
                        {session.speaker && (
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 mr-1 text-primary-500" />
                            {session.speaker}
                          </div>
                        )}
                        {session.room && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-primary-500" />
                            {session.room}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div className="card">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">
                Inscription
              </h3>

              {hasTicket ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                  <div className="text-green-700 font-medium mb-2">
                    ✓ Vous êtes inscrit
                  </div>
                  <Link
                    href="/tickets/my-tickets"
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    Voir mon ticket →
                  </Link>
                </div>
              ) : canRegister ? (
                <>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-primary-600">
                      {event.isFree ? 'Gratuit' : `${event.ticketPrice} €`}
                    </div>
                  </div>
                  <button
                    onClick={handleRegister}
                    className="w-full btn-primary"
                  >
                    S'inscrire maintenant
                  </button>
                  <p className="text-xs text-secondary-600 text-center mt-2">
                    Places restantes: {event.maxCapacity - event.currentCapacity}
                  </p>
                </>
              ) : (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center text-red-700">
                  {event.status !== 'published' ? 'Événement non publié' :
                   event.currentCapacity >= event.maxCapacity ? 'Complet' :
                   'Inscription fermée'}
                </div>
              )}
            </div>

            {/* Organizer */}
            <div className="card">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">
                Organisateur
              </h3>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-3">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-medium text-secondary-900">
                    {event.organizer?.name || 'Organisateur'}
                  </div>
                  {event.organizer?.organization && (
                    <div className="text-sm text-secondary-600">
                      {event.organizer.organization}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats (Admin/Organizer only) */}
            {(user?.role === 'admin' || event.organizerId === user?.id) && (
              <div className="card">
                <h3 className="text-lg font-bold text-secondary-900 mb-4">
                  Statistiques
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Inscrits</span>
                    <span className="font-bold text-secondary-900">{participants.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Check-in</span>
                    <span className="font-bold text-secondary-900">
                      {participants.filter((p: any) => p.checkedIn).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Taux</span>
                    <span className="font-bold text-secondary-900">
                      {event.maxCapacity > 0 
                        ? Math.round((event.currentCapacity / event.maxCapacity) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
