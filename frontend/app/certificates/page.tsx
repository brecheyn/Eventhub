"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Loading from "@/components/ui/Loading";
import { certificatesAPI } from "@/lib/api/certificates";
import { ticketsAPI } from "@/lib/api/tickets";
import {
  Award,
  Download,
  Calendar,
  MapPin,
  FileCheck,
  AlertCircle,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";

export default function CertificatesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [eligibleEvents, setEligibleEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      console.log("🔄 Chargement des données certificats...");

      // 1. Charger les certificats existants
      const { certificates: myCerts } =
        await certificatesAPI.getMyCertificates();
      console.log("📜 Certificats existants:", myCerts.length);
      setCertificates(myCerts);

      // 2. Charger TOUS les tickets
      const { tickets } = await ticketsAPI.getMyTickets();
      console.log("🎫 Tous mes tickets:", tickets.length);

      // 3. Filtrer : tickets avec check-in UNIQUEMENT
      const checkedInTickets = tickets.filter((t: any) => {
        console.log(`Ticket ${t.ticketNumber}:`, {
          eventTitle: t.event?.title,
          checkedIn: t.checkedIn,
          eventId: t.eventId,
        });
        return t.checkedIn === true;
      });

      console.log(" Tickets check-in:", checkedInTickets.length);

      // 4. Exclure ceux qui ont déjà un certificat
      const certificateEventIds = myCerts.map((c: any) => c.eventId);
      console.log("📋 Event IDs avec certificat:", certificateEventIds);

      const eligible = checkedInTickets
        .filter((t: any) => !certificateEventIds.includes(t.eventId))
        .map((t: any) => ({
          id: t.eventId,
          ...t.event,
          ticketId: t.id,
          ticketNumber: t.ticketNumber,
        }));

      console.log("🎯 Événements éligibles:", eligible.length);
      eligible.forEach((e: any) => console.log("  -", e.title));

      setEligibleEvents(eligible);
    } catch (error) {
      console.error(" Erreur chargement:", error);
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (eventId: string) => {
    setGenerating(eventId);
    try {
      console.log("🔄 Génération certificat pour événement:", eventId);
      await certificatesAPI.generate(eventId);
      toast.success("Certificat généré avec succès ! ");
      await loadData(); // Recharger
    } catch (error: any) {
      console.error(" Erreur génération:", error);
      const message =
        error.response?.data?.message || "Erreur lors de la génération";
      toast.error(message);
    } finally {
      setGenerating(null);
    }
  };

  const handleDownload = (certificate: any) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${certificate.pdfUrl}`;
    console.log("📥 Téléchargement:", url);
    window.open(url, "_blank");
  };

  if (authLoading || loading) return <Loading />;
  if (!isAuthenticated) return null;

  const hasNoCertificatesAndNoEligible =
    certificates.length === 0 && eligibleEvents.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-secondary-50/50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 flex items-center">
            <Award className="h-8 w-8 mr-3 text-primary-600" />
            Mes Certificats
          </h1>
          <p className="mt-2 text-secondary-600">
            Téléchargez vos certificats de participation
          </p>
        </div>

        {/* Info Box */}
        <div className="card mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">
                Comment obtenir un certificat ?
              </p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Inscrivez-vous à un événement</li>
                <li>Participez et faites valider votre présence (check-in)</li>
                <li>Après le check-in, générez votre certificat ci-dessous</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Debug Info (Temporaire) */}
        <div className="card mb-6 bg-yellow-50 border-yellow-200">
          <div className="text-sm">
            <p className="font-bold mb-2">🔍 Debug Info:</p>
            <ul className="space-y-1 text-yellow-800">
              <li>✓ Certificats générés: {certificates.length}</li>
              <li>✓ Événements éligibles: {eligibleEvents.length}</li>
            </ul>
          </div>
        </div>

        {/* Événements Éligibles (Check-in fait mais pas de certificat) */}
        {eligibleEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6 flex items-center">
              <Plus className="h-6 w-6 mr-2 text-green-600" />
              Certificats à Générer ({eligibleEvents.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eligibleEvents.map((event) => (
                <div
                  key={event.id}
                  className="card bg-green-50 border-2 border-green-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                    <span className="badge badge-success">✓ Présent</span>
                  </div>

                  <h3 className="text-lg font-bold text-secondary-900 mb-3">
                    {event.title}
                  </h3>

                  <div className="space-y-2 text-sm text-secondary-600 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-green-500" />
                      {format(new Date(event.startDate), "dd MMMM yyyy", {
                        locale: fr,
                      })}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-green-500" />
                      {event.location}
                    </div>
                  </div>

                  <button
                    onClick={() => handleGenerate(event.id)}
                    disabled={generating === event.id}
                    className="w-full btn-primary text-sm"
                  >
                    {generating === event.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                        Génération...
                      </>
                    ) : (
                      <>
                        <Award className="h-4 w-4 mr-2 inline" />
                        Générer mon certificat
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificats Existants */}
        {certificates.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-6 flex items-center">
              <FileCheck className="h-6 w-6 mr-2 text-primary-600" />
              Mes Certificats ({certificates.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="card hover:shadow-lg transition-shadow group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                    <span className="badge badge-success">
                      <FileCheck className="h-3 w-3 mr-1" />
                      Certifié
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-secondary-900 mb-3">
                    {certificate.event?.title}
                  </h3>

                  <div className="space-y-2 text-sm text-secondary-600 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-primary-500" />
                      {format(
                        new Date(certificate.event?.startDate),
                        "dd MMMM yyyy",
                        { locale: fr },
                      )}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                      {certificate.event?.location}
                    </div>
                  </div>

                  <div className="border-t border-secondary-200 pt-4 mt-4">
                    <div className="flex justify-between items-center text-xs text-secondary-500 mb-3">
                      <div>N° {certificate.certificateNumber}</div>
                      <div>
                        Émis le{" "}
                        {format(
                          new Date(certificate.issuedDate),
                          "dd/MM/yyyy",
                          { locale: fr },
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(certificate)}
                      className="w-full btn-primary text-sm"
                    >
                      <Download className="h-4 w-4 mr-2 inline" />
                      Télécharger le PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {hasNoCertificatesAndNoEligible && (
          <div className="card text-center py-16">
            <Award className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              Aucun certificat disponible
            </h3>
            <p className="text-secondary-600 mb-6">
              Participez à des événements et faites valider votre présence pour
              obtenir des certificats
            </p>
            <button
              onClick={() => router.push("/events")}
              className="btn-primary"
            >
              Voir les événements
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
