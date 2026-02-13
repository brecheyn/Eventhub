"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Loading from "@/components/ui/Loading";
import { eventsAPI } from "@/lib/api/events";
import { checkinAPI } from "@/lib/api/checkin";
import {
  Scan,
  Search,
  CheckCircle,
  TrendingUp,
  XCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CheckinPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [lastScan, setLastScan] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role !== "admin" && user?.role !== "organizer") {
        router.push("/dashboard");
        return;
      }
      loadEvents();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (selectedEvent) {
      loadStats(selectedEvent);
    }
  }, [selectedEvent]);

  const loadEvents = async () => {
    try {
      const { events: allEvents } = await eventsAPI.getAll();
      const publishedEvents = allEvents.filter(
        (e: any) => e.status === "published" || e.status === "ongoing",
      );
      setEvents(publishedEvents);
      if (publishedEvents.length > 0) {
        setSelectedEvent(publishedEvents[0].id);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (eventId: string) => {
    try {
      const { stats: eventStats } = await checkinAPI.getStats(eventId);
      setStats(eventStats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNumber.trim()) return;

    setCheckingIn(true);
    try {
      const result = await checkinAPI.scan({
        ticketNumber: ticketNumber.trim(),
      });

      setLastScan({
        success: true,
        participant: result.ticket?.participant,
        event: result.ticket?.event,
        time: new Date(),
      });

      toast.success(" Check-in réussi !");
      setTicketNumber("");
      loadStats(selectedEvent);

      // Auto-clear last scan after 5 seconds
      setTimeout(() => setLastScan(null), 5000);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Ticket invalide ou déjà scanné";

      setLastScan({
        success: false,
        error: message,
        time: new Date(),
      });

      toast.error(message);
      setTicketNumber("");
    } finally {
      setCheckingIn(false);
    }
  };

  if (authLoading || loading) return <Loading />;
  if (!isAuthenticated) return null;

  const selectedEventData = events.find((e) => e.id === selectedEvent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-secondary-50/50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 flex items-center">
            <Scan className="h-8 w-8 mr-3 text-primary-600" />
            Check-in Participants
          </h1>
          <p className="mt-2 text-secondary-600">
            Scanner les tickets des participants à leur arrivée
          </p>
        </div>

        {/* Event Selector */}
        <div className="card mb-6">
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Événement
          </label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="input-field"
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} -{" "}
                {new Date(event.startDate).toLocaleDateString("fr-FR")}
              </option>
            ))}
          </select>
          {selectedEventData && (
            <p className="mt-2 text-sm text-secondary-600">
              📍 {selectedEventData.location} •{" "}
              {selectedEventData.currentCapacity}/
              {selectedEventData.maxCapacity} inscrits
            </p>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border-2 border-secondary-100 rounded-lg p-4">
              <div className="text-sm text-secondary-600">Total tickets</div>
              <div className="text-2xl font-bold text-secondary-900">
                {stats.totalTickets}
              </div>
            </div>
            <div className="bg-white border-2 border-green-100 rounded-lg p-4">
              <div className="text-sm text-green-600"> Présents</div>
              <div className="text-2xl font-bold text-green-700">
                {stats.checkedIn}
              </div>
            </div>
            <div className="bg-white border-2 border-red-100 rounded-lg p-4">
              <div className="text-sm text-red-600"> Absents</div>
              <div className="text-2xl font-bold text-red-700">
                {stats.notCheckedIn}
              </div>
            </div>
            <div className="bg-white border-2 border-primary-100 rounded-lg p-4">
              <div className="text-sm text-primary-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                Taux présence
              </div>
              <div className="text-2xl font-bold text-primary-700">
                {stats.checkinRate}%
              </div>
            </div>
          </div>
        )}

        {/* Last Scan Result */}
        {lastScan && (
          <div
            className={`card mb-6 ${
              lastScan.success
                ? "bg-green-50 border-2 border-green-200"
                : "bg-red-50 border-2 border-red-200"
            }`}
          >
            <div className="flex items-start">
              {lastScan.success ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-900 mb-2">
                      Check-in réussi !
                    </h3>
                    <p className="text-green-800">
                      <strong>{lastScan.participant?.name}</strong> est
                      maintenant enregistré(e) comme présent(e).
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-600 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-900 mb-2">
                      Échec du check-in
                    </h3>
                    <p className="text-red-800">{lastScan.error}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Scanner */}
        <div className="card">
          <h2 className="text-xl font-bold text-secondary-900 mb-6 flex items-center">
            <Scan className="h-6 w-6 mr-2 text-primary-600" />
            Scanner un ticket
          </h2>

          <form onSubmit={handleCheckIn} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Numéro de ticket
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                <input
                  type="text"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  className="input-field pl-10 text-lg font-mono"
                  placeholder="TKT-12345-67890"
                  autoFocus
                  required
                  disabled={checkingIn}
                />
              </div>
              <p className="mt-2 text-sm text-secondary-500">
                Scanner le QR code ou saisir le numéro manuellement
              </p>
            </div>

            <button
              type="submit"
              disabled={checkingIn || !ticketNumber.trim()}
              className="w-full btn-primary py-4 text-lg inline-flex items-center justify-center"
            >
              {checkingIn ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Vérification...
                </>
              ) : (
                <>
                  <CheckCircle className="h-6 w-6 mr-2" />
                  Valider le check-in
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-secondary-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">
                    Instructions
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Scanner le QR code du participant</li>
                    <li>• Ou saisir le numéro de ticket manuellement</li>
                    <li>• Le système détecte automatiquement les doublons</li>
                    <li>
                      • Un participant ne peut être check-in qu'une seule fois
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
