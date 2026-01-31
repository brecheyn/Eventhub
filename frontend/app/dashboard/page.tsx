'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import StatCard from '@/components/ui/StatCard';
import Loading from '@/components/ui/Loading';
import { eventsAPI } from '@/lib/api/events';
import { Calendar, Users, CheckCircle, Award, Plus, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    publishedEvents: 0,
    totalParticipants: 0,
    totalCheckins: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      const { events: allEvents } = await eventsAPI.getAll();
      setEvents(allEvents.slice(0, 5));
      
      setStats({
        totalEvents: allEvents.length,
        publishedEvents: allEvents.filter((e: any) => e.status === 'published').length,
        totalParticipants: allEvents.reduce((sum: number, e: any) => sum + e.currentCapacity, 0),
        totalCheckins: 0,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <Loading />;
  if (!isAuthenticated) return null;

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
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 flex items-center">
              Bonjour {user?.name} !
              <span className="ml-3 text-2xl">👋</span>
            </h1>
            <p className="mt-2 text-secondary-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Voici un aperçu de vos événements
            </p>
          </div>
          
          {(user?.role === 'admin' || user?.role === 'organizer') && (
            <Link href="/events/new" className="btn-primary inline-flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Nouvel événement
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Événements"
            value={stats.totalEvents}
            icon={Calendar}
            color="orange"
          />
          <StatCard
            title="Publiés"
            value={stats.publishedEvents}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Participants"
            value={stats.totalParticipants}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Check-ins"
            value={stats.totalCheckins}
            icon={Award}
            color="purple"
          />
        </div>

        {/* Recent Events */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-secondary-900">
                Événements Récents
              </h2>
              <p className="text-sm text-secondary-600 mt-1">
                Dernières créations et mises à jour
              </p>
            </div>
            <Link href="/events" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center group">
              Voir tout
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-secondary-400" />
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                Aucun événement pour le moment
              </h3>
              <p className="text-secondary-600 mb-6">
                Commencez par créer votre premier événement
              </p>
              {(user?.role === 'admin' || user?.role === 'organizer') && (
                <Link href="/events/new" className="btn-primary inline-flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Créer un événement
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border-2 border-secondary-100 rounded-xl p-5 hover:border-primary-300 hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-sm text-secondary-600 mt-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary-500" />
                        {event.location} • {format(new Date(event.startDate), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className={`badge ${getStatusBadge(event.status)}`}>
                          {event.status}
                        </span>
                        <span className="text-sm text-secondary-600 flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {event.currentCapacity}/{event.maxCapacity} participants
                        </span>
                        {event.isFree && (
                          <span className="badge badge-success">
                            Gratuit
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/events/${event.id}`}
                      className="btn-secondary text-sm ml-4"
                    >
                      Détails
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions (si admin ou organizer) */}
        {(user?.role === 'admin' || user?.role === 'organizer') && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/events/new" className="card hover:border-primary-300 group cursor-pointer">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600">
                    Nouvel événement
                  </h3>
                  <p className="text-sm text-secondary-600">Créer rapidement</p>
                </div>
              </div>
            </Link>

            <Link href="/participants" className="card hover:border-green-300 group cursor-pointer">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-secondary-900 group-hover:text-green-600">
                    Participants
                  </h3>
                  <p className="text-sm text-secondary-600">Gérer les inscrits</p>
                </div>
              </div>
            </Link>

            <Link href="/certificates" className="card hover:border-purple-300 group cursor-pointer">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-secondary-900 group-hover:text-purple-600">
                    Certificats
                  </h3>
                  <p className="text-sm text-secondary-600">Générer et consulter</p>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
