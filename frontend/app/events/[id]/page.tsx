"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Loading from "@/components/ui/Loading";
import SessionsList from "@/components/events/SessionsList";
import { eventsAPI } from "@/lib/api/events";
import { ticketsAPI } from "@/lib/api/tickets";
import { EVENT_TYPES } from "@/lib/constants/eventTypes";
import {
  canEditEvent,
  canDeleteEvent,
  canRegisterToEvent,
  getEventActualStatus,
  getRegistrationBlockReason,
  isEventCompleted,
} from "@/lib/utils/permissions";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Edit,
  Trash2,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  AlertCircle,
  User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";

export default function EventDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasTicket, setHasTicket] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    loadEventDetails();
    checkUserTicket();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      const { event: eventData } = await eventsAPI.getById(eventId);
      setEvent(eventData);

      if (user?.role === "admin" || eventData.organizerId === user?.id) {
        const { tickets } = await eventsAPI.getParticipants(eventId);
        setParticipants(tickets);
      }
    } catch (error) {
      toast.error("Événement introuvable");
      router.push("/events");
    } finally {
      setLoading(false);
    }
  };

  const checkUserTicket = async () => {
    try {
      const { tickets } = await ticketsAPI.getMyTickets();
      const userTicket = tickets.find((t: any) => t.eventId === eventId);
      setHasTicket(!!userTicket);
    } catch (error) {
      console.error("Error checking ticket:", error);
    }
  };

  const handleRegister = async () => {
    if (!event) return;

    if (!canRegisterToEvent(event)) {
      const reason = getRegistrationBlockReason(event);
      toast.error(reason || "Impossible de s'inscrire");
      return;
    }

    setRegistering(true);
    try {
      await ticketsAPI.create(eventId);
      toast.success("Inscription réussie ! ");
      setHasTicket(true);
      loadEventDetails();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de l'inscription",
      );
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    if (!canDeleteEvent(user, event)) {
      toast.error(
        "Vous n'avez pas les permissions pour supprimer cet événement",
      );
      return;
    }

    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return;

    try {
      await eventsAPI.delete(eventId);
      toast.success("Événement supprimé");
      router.push("/events");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading) return <Loading />;
  if (!event) return null;

  const actualStatus = getEventActualStatus(event);
  const completed = isEventCompleted(event);
  const userCanEdit = canEditEvent(user, event);
  const userCanDelete = canDeleteEvent(user, event);
  const userCanRegister = canRegisterToEvent(event);
  const registrationBlockReason = getRegistrationBlockReason(event);

  const statusBadges: any = {
    published: { class: "badge-info", label: "À venir" },
    ongoing: { class: "badge-success", label: "En cours" },
    completed: { class: "badge-orange", label: "Terminé" },
    draft: { class: "badge-warning", label: "Brouillon" },
    cancelled: { class: "badge-danger", label: "Annulé" },
  };

  const statusBadge = statusBadges[actualStatus] || statusBadges.published;

  // Trouver le type d'événement
  const eventTypeInfo =
    EVENT_TYPES.find((t) => t.value === event.eventType) || EVENT_TYPES[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-secondary-50/50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/events"
          className="inline-flex items-center text-secondary-600 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux événements
        </Link>

        {/* Warning si événement terminé */}
        {completed && (
          <div className="mb-6 bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-bold text-orange-900">Événement terminé</h3>
                <p className="text-sm text-orange-800 mt-1">
                  Cet événement est terminé. Les inscriptions et modifications
                  ne sont plus possibles.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="card">
              {/* Image de l'événement */}
              {event.imageUrl && (
                <div className="mb-6 -mx-6 -mt-6">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${event.imageUrl}`}
                    alt={event.title}
                    width={800}
                    height={400}
                    className="w-full h-64 object-cover rounded-t-xl"
                  />
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className={`badge ${statusBadge.class}`}>
                    {statusBadge.label}
                  </span>
                  <span className="badge badge-secondary">
                    {eventTypeInfo.emoji}{" "}
                    {eventTypeInfo.label.replace(eventTypeInfo.emoji + " ", "")}
                  </span>
                </div>
                {(userCanEdit || userCanDelete) && (
                  <div className="flex space-x-2">
                    {userCanEdit && !completed && (
                      <Link
                        href={`/events/${eventId}/edit`}
                        className="btn-secondary text-sm inline-flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Link>
                    )}
                    {userCanDelete && (
                      <button
                        onClick={handleDelete}
                        className="btn-danger text-sm inline-flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </button>
                    )}
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
                    <div className="font-medium text-secondary-900">Dates</div>
                    <div className="text-secondary-600">
                      Du{" "}
                      {format(
                        new Date(event.startDate),
                        "dd MMMM yyyy à HH:mm",
                        { locale: fr },
                      )}
                      <br />
                      au{" "}
                      {format(new Date(event.endDate), "dd MMMM yyyy à HH:mm", {
                        locale: fr,
                      })}
                    </div>
                    {completed && (
                      <div className="mt-2 inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Événement terminé
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                  <div>
                    <div className="font-medium text-secondary-900">Lieu</div>
                    <div className="text-secondary-600">
                      {event.location}
                      {event.venue && (
                        <>
                          <br />
                          {event.venue}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Users className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                  <div>
                    <div className="font-medium text-secondary-900">
                      Participants
                    </div>
                    <div className="text-secondary-600">
                      {event.currentCapacity} / {event.maxCapacity} inscrits
                    </div>
                    <div className="mt-2 w-full bg-secondary-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${event.maxCapacity > 0 ? (event.currentCapacity / event.maxCapacity) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                  <div>
                    <div className="font-medium text-secondary-900">Tarif</div>
                    <div className="text-secondary-600">
                      {event.isFree ? (
                        <span className="text-green-600 font-semibold">
                          Gratuit
                        </span>
                      ) : (
                        <span className="text-primary-600 font-semibold">
                          {event.ticketPrice} €
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sessions */}
            <SessionsList
              eventId={eventId}
              canEdit={userCanEdit && !completed}
            />
          </div>

          {/* Sidebar - reste identique */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div className="card">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">
                Inscription
              </h3>

              {completed ? (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 text-center text-orange-700">
                  <Lock className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-medium">Événement terminé</div>
                  <div className="text-sm mt-1">
                    Les inscriptions sont fermées
                  </div>
                </div>
              ) : hasTicket ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
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
              ) : userCanRegister ? (
                <>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-primary-600">
                      {event.isFree ? "Gratuit" : `${event.ticketPrice} €`}
                    </div>
                  </div>
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full btn-primary"
                  >
                    {registering ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                        Inscription...
                      </>
                    ) : (
                      "S'inscrire maintenant"
                    )}
                  </button>
                  <p className="text-xs text-secondary-600 text-center mt-2">
                    Places restantes:{" "}
                    {event.maxCapacity - event.currentCapacity}
                  </p>
                </>
              ) : (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                  <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-red-700">
                    {registrationBlockReason || "Inscription fermée"}
                  </div>
                </div>
              )}
            </div>

            {/* Stats (Admin/Organizer only) */}
            {(user?.role === "admin" || event.organizerId === user?.id) && (
              <div className="card">
                <h3 className="text-lg font-bold text-secondary-900 mb-4">
                  Statistiques
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Inscrits</span>
                    <span className="font-bold text-secondary-900">
                      {participants.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Check-in</span>
                    <span className="font-bold text-secondary-900">
                      {participants.filter((p: any) => p.checkedIn).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Taux remplissage</span>
                    <span className="font-bold text-secondary-900">
                      {event.maxCapacity > 0
                        ? Math.round(
                            (event.currentCapacity / event.maxCapacity) * 100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                {completed && (
                  <div className="mt-4 pt-4 border-t border-secondary-200">
                    <Link
                      href="/participants"
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Voir tous les participants →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
