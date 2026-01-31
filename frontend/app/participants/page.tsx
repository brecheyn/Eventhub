'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Loading from '@/components/ui/Loading';
import { eventsAPI } from '@/lib/api/events';
import { Users, Search, Filter, Download, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ParticipantsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role !== 'admin' && user?.role !== 'organizer') {
        router.push('/dashboard');
        return;
      }
      loadEvents();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedEvent) {
      loadParticipants(selectedEvent);
    }
  }, [selectedEvent]);

  useEffect(() => {
    filterParticipants();
  }, [searchTerm, statusFilter, participants]);

  const loadEvents = async () => {
    try {
      const { events: allEvents } = await eventsAPI.getAll();
      setEvents(allEvents);
      if (allEvents.length > 0) {
        setSelectedEvent(allEvents[0].id);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async (eventId: string) => {
    try {
      const { tickets } = await eventsAPI.getParticipants(eventId);
      setParticipants(tickets);
      setFilteredParticipants(tickets);
    } catch (error) {
      toast.error('Erreur lors du chargement des participants');
    }
  };

  const filterParticipants = () => {
    let filtered = participants;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.participant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.participant?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter === 'checkedIn') {
      filtered = filtered.filter(p => p.checkedIn);
    } else if (statusFilter === 'notCheckedIn') {
      filtered = filtered.filter(p => !p.checkedIn);
    }

    setFilteredParticipants(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Nom', 'Email', 'N° Ticket', 'Check-in', 'Date inscription'];
    const rows = filteredParticipants.map(p => [
      p.participant?.name,
      p.participant?.email,
      p.ticketNumber,
      p.checkedIn ? 'Oui' : 'Non',
      new Date(p.createdAt).toLocaleDateString('fr-FR')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants-${selectedEvent}.csv`;
    a.click();
    
    toast.success('Export réussi !');
  };

  if (authLoading || loading) return <Loading />;
  if (!isAuthenticated) return null;

  const selectedEventData = events.find(e => e.id === selectedEvent);
  const stats = {
    total: participants.length,
    checkedIn: participants.filter(p => p.checkedIn).length,
    notCheckedIn: participants.filter(p => !p.checkedIn).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-secondary-50/50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 flex items-center">
            <Users className="h-8 w-8 mr-3 text-primary-600" />
            Participants
          </h1>
          <p className="mt-2 text-secondary-600">
            Gérez les inscriptions à vos événements
          </p>
        </div>

        {/* Event Selector */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Événement
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="input-field"
              >
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Nom, email ou n° ticket..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border-2 border-secondary-100 rounded-lg p-4">
            <div className="text-sm text-secondary-600">Total inscrits</div>
            <div className="text-2xl font-bold text-secondary-900">{stats.total}</div>
          </div>
          <div className="bg-white border-2 border-green-100 rounded-lg p-4">
            <div className="text-sm text-green-600">Check-in</div>
            <div className="text-2xl font-bold text-green-700">{stats.checkedIn}</div>
          </div>
          <div className="bg-white border-2 border-red-100 rounded-lg p-4">
            <div className="text-sm text-red-600">Non présents</div>
            <div className="text-2xl font-bold text-red-700">{stats.notCheckedIn}</div>
          </div>
          <div className="bg-white border-2 border-primary-100 rounded-lg p-4">
            <div className="text-sm text-primary-600">Taux présence</div>
            <div className="text-2xl font-bold text-primary-700">
              {stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Filters & Export */}
        <div className="card mb-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'text-secondary-600 hover:bg-secondary-100'
                }`}
              >
                Tous ({participants.length})
              </button>
              <button
                onClick={() => setStatusFilter('checkedIn')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'checkedIn'
                    ? 'bg-green-600 text-white'
                    : 'text-secondary-600 hover:bg-secondary-100'
                }`}
              >
                Présents ({stats.checkedIn})
              </button>
              <button
                onClick={() => setStatusFilter('notCheckedIn')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'notCheckedIn'
                    ? 'bg-red-600 text-white'
                    : 'text-secondary-600 hover:bg-secondary-100'
                }`}
              >
                Absents ({stats.notCheckedIn})
              </button>
            </div>

            <button
              onClick={exportToCSV}
              className="btn-secondary inline-flex items-center"
              disabled={filteredParticipants.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </button>
          </div>
        </div>

        {/* Participants Table */}
        <div className="card">
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
              <p className="text-secondary-600">
                {searchTerm || statusFilter !== 'all'
                  ? 'Aucun participant trouvé'
                  : 'Aucun participant pour cet événement'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-secondary-100">
                    <th className="text-left py-3 px-4 font-semibold text-secondary-900">Nom</th>
                    <th className="text-left py-3 px-4 font-semibold text-secondary-900">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-secondary-900">N° Ticket</th>
                    <th className="text-center py-3 px-4 font-semibold text-secondary-900">Check-in</th>
                    <th className="text-center py-3 px-4 font-semibold text-secondary-900">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((participant) => (
                    <tr
                      key={participant.id}
                      className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-secondary-900">
                        {participant.participant?.name}
                      </td>
                      <td className="py-3 px-4 text-secondary-600">
                        {participant.participant?.email}
                      </td>
                      <td className="py-3 px-4 font-mono text-sm text-secondary-600">
                        {participant.ticketNumber}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {participant.checkedIn ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Présent
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <XCircle className="h-4 w-4 mr-1" />
                            Absent
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-secondary-600">
                        {new Date(participant.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
