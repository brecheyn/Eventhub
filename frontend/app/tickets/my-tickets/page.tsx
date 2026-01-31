'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Loading from '@/components/ui/Loading';
import { ticketsAPI } from '@/lib/api/tickets';
import { Ticket, Calendar, MapPin, QrCode, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';

export default function MyTicketsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTickets();
    }
  }, [isAuthenticated]);

  const loadTickets = async () => {
    try {
      const { tickets: myTickets } = await ticketsAPI.getMyTickets();
      setTickets(myTickets);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (ticketId: string) => {
    if (!confirm('Annuler ce ticket ?')) return;

    try {
      await ticketsAPI.cancel(ticketId);
      toast.success('Ticket annulé');
      loadTickets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  if (authLoading || loading) return <Loading />;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-secondary-50/50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 flex items-center">
            <Ticket className="h-8 w-8 mr-3 text-primary-600" />
            Mes Tickets
          </h1>
          <p className="mt-2 text-secondary-600">
            Gérez vos inscriptions aux événements
          </p>
        </div>

        {tickets.length === 0 ? (
          <div className="card text-center py-16">
            <Ticket className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              Aucun ticket
            </h3>
            <p className="text-secondary-600 mb-6">
              Inscrivez-vous à un événement pour obtenir votre premier ticket
            </p>
            <button
              onClick={() => router.push('/events')}
              className="btn-primary"
            >
              Voir les événements
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className={`badge ${
                    ticket.checkedIn ? 'badge-success' :
                    ticket.status === 'confirmed' ? 'badge-info' :
                    'badge-danger'
                  }`}>
                    {ticket.checkedIn ? 'Présent' : ticket.status}
                  </span>
                  {!ticket.checkedIn && ticket.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancel(ticket.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <h3 className="text-xl font-bold text-secondary-900 mb-2">
                  {ticket.event?.title}
                </h3>

                <div className="space-y-2 text-sm text-secondary-600 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary-500" />
                    {format(new Date(ticket.event?.startDate), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                    {ticket.event?.location}
                  </div>
                </div>

                <div className="border-t border-secondary-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-secondary-500">N° Ticket</div>
                      <div className="font-mono text-sm font-bold text-secondary-900">
                        {ticket.ticketNumber}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="btn-secondary text-sm inline-flex items-center"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Code
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-secondary-900">QR Code</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-secondary-400 hover:text-secondary-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="bg-white p-6 border-4 border-secondary-100 rounded-xl mb-6">
              {selectedTicket.qrCode && (
                <div dangerouslySetInnerHTML={{ __html: `<img src="${selectedTicket.qrCode}" class="w-full" />` }} />
              )}
            </div>

            <div className="text-center">
              <div className="text-sm text-secondary-600 mb-2">
                {selectedTicket.event?.title}
              </div>
              <div className="font-mono text-lg font-bold text-secondary-900">
                {selectedTicket.ticketNumber}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
