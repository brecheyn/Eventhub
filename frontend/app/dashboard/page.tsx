"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Loading from "@/components/ui/Loading";
import StatCard from "@/components/ui/StatCard";
import { eventsAPI } from "@/lib/api/events";
import {
  Calendar,
  Users,
  CheckCircle,
  TrendingUp,
  Plus,
  Clock,
  MapPin,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { format, isPast, isFuture, isToday } from "date-fns";
import { fr } from "date-fns/locale";

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    }
  }, [isAuthenticated]);

  const loadEvents = async () => {
    try {
      const { events: allEvents } = await eventsAPI.getAll();
      setEvents(allEvents);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActualStatus = (event: any) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (isPast(endDate)) return "completed";
    if (isPast(startDate) && isFuture(endDate)) return "ongoing";
    if (event.status === "cancelled") return "cancelled";
    if (event.status === "draft") return "draft";
    return "published";
  };

  const getStatusBadge = (event: any) => {
    const status = getActualStatus(event);
    const badges: any = {
      published: { class: "badge-info", label: "À venir", icon: Calendar },
      draft: { class: "badge-warning", label: "Brouillon", icon: null },
      ongoing: { class: "badge-success", label: "En cours", icon: Clock },
      completed: { class: "badge-orange", label: "Terminé", icon: CheckCircle },
      cancelled: { class: "badge-danger", label: "Annulé", icon: null },
    };
    return badges[status] || badges.published;
  };

  if (authLoading || loading) return <Loading />;
  if (!isAuthenticated) return null;

  // Calculer les statistiques avec statuts réels
  const stats = {
    totalEvents: events.length,
    publishedEvents: events.filter((e) => getActualStatus(e) === "published")
      .length,
    ongoingEvents: events.filter((e) => getActualStatus(e) === "ongoing")
      .length,
    completedEvents: events.filter((e) => getActualStatus(e) === "completed")
      .length,
    totalParticipants: events.reduce((sum, e) => sum + e.currentCapacity, 0),
    totalCheckins: 0, // À calculer si vous avez cette donnée
  };

  // Trier les événements : En cours > À venir > Terminés
  const sortedEvents = [...events].sort((a, b) => {
    const statusA = getActualStatus(a);
    const statusB = getActualStatus(b);

    // Priorité: ongoing > published > completed > draft > cancelled
    const priority: any = {
      ongoing: 0,
      published: 1,
      completed: 2,
      draft: 3,
      cancelled: 4,
    };

    if (priority[statusA] !== priority[statusB]) {
      return priority[statusA] - priority[statusB];
    }

    // Si même statut, trier par date
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  // Limiter à 6 événements récents
  const recentEvents = sortedEvents.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-secondary-50/50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900">
            Bienvenue, {user?.name} !
          </h1>
          <p className="mt-2 text-secondary-600">
            Voici un aperçu de votre activité
          </p>
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
            title="En Cours"
            value={stats.ongoingEvents}
            icon={Clock}
            color="green"
          />
          <StatCard
            title="À Venir"
            value={stats.publishedEvents}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Terminés"
            value={stats.completedEvents}
            icon={CheckCircle}
            color="purple"
          />
        </div>

        {/* Additional Stats (Admin/Organizer) */}
        {(user?.role === "admin" || user?.role === "organizer") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card bg-gradient-to-br from-primary-50 to-white border-2 border-primary-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-secondary-900">
                  Participants Total
                </h3>
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <p className="text-3xl font-bold text-primary-600">
                {stats.totalParticipants}
              </p>
              <p className="text-sm text-secondary-600 mt-2">
                Inscrits à tous les événements
              </p>
            </div>

            <div className="card bg-gradient-to-br from-green-50 to-white border-2 border-green-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-secondary-900">
                  Taux de Remplissage
                </h3>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600">
                {events.length > 0
                  ? Math.round(
                      (stats.totalParticipants /
                        events.reduce((sum, e) => sum + e.maxCapacity, 0)) *
                        100,
                    )
                  : 0}
                %
              </p>
              <p className="text-sm text-secondary-600 mt-2">
                Moyenne sur tous les événements
              </p>
            </div>
          </div>
        )}

        {/* Recent Events */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-secondary-900">
              Événements Récents
            </h2>
            <Link
              href="/events"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center"
            >
              Voir tout
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {recentEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                Aucun événement
              </h3>
              <p className="text-secondary-600 mb-6">
                {user?.role === "admin" || user?.role === "organizer"
                  ? "Commencez par créer votre premier événement"
                  : "Aucun événement disponible pour le moment"}
              </p>
              {(user?.role === "admin" || user?.role === "organizer") && (
                <Link
                  href="/events/new"
                  className="btn-primary inline-flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Créer un événement
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {recentEvents.map((event) => {
                const statusBadge = getStatusBadge(event);
                const StatusIcon = statusBadge.icon;

                return (
                  <div
                    key={event.id}
                    className="border-2 border-secondary-100 rounded-xl p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => router.push(`/events/${event.id}`)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`badge ${statusBadge.class} inline-flex items-center`}
                          >
                            {StatusIcon && (
                              <StatusIcon className="h-3 w-3 mr-1" />
                            )}
                            {statusBadge.label}
                          </span>
                          {event.isFree && (
                            <span className="badge badge-success">Gratuit</span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {event.title}
                        </h3>

                        <div className="flex flex-wrap gap-4 text-sm text-secondary-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1.5 text-primary-500" />
                            {format(new Date(event.startDate), "dd MMM yyyy", {
                              locale: fr,
                            })}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1.5 text-primary-500" />
                            {event.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1.5 text-primary-500" />
                            {event.currentCapacity}/{event.maxCapacity}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm text-secondary-600">Taux</div>
                          <div className="text-xl font-bold text-primary-600">
                            {event.maxCapacity > 0
                              ? Math.round(
                                  (event.currentCapacity / event.maxCapacity) *
                                    100,
                                )
                              : 0}
                            %
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-secondary-400 group-hover:text-primary-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions (Admin/Organizer) */}
        {(user?.role === "admin" || user?.role === "organizer") && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Link
              href="/events/new"
              className="card hover:shadow-lg transition-shadow group cursor-pointer bg-gradient-to-br from-primary-50 to-white border-2 border-primary-100 hover:border-primary-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">
                  Nouvel Événement
                </h3>
              </div>
              <p className="text-sm text-secondary-600">
                Créez et publiez un nouvel événement
              </p>
            </Link>

            <Link
              href="/participants"
              className="card hover:shadow-lg transition-shadow group cursor-pointer bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 hover:border-blue-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-secondary-900 group-hover:text-blue-600 transition-colors">
                  Participants
                </h3>
              </div>
              <p className="text-sm text-secondary-600">
                Gérez les inscriptions
              </p>
            </Link>

            <Link
              href="/checkin"
              className="card hover:shadow-lg transition-shadow group cursor-pointer bg-gradient-to-br from-green-50 to-white border-2 border-green-100 hover:border-green-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-secondary-900 group-hover:text-green-600 transition-colors">
                  Check-in
                </h3>
              </div>
              <p className="text-sm text-secondary-600">Scanner les tickets</p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
