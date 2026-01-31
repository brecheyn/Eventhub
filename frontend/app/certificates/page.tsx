'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Loading from '@/components/ui/Loading';
import { certificatesAPI } from '@/lib/api/certificates';
import { eventsAPI } from '@/lib/api/events';
import { Award, Download, Calendar, MapPin, FileCheck, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function CertificatesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [eligibleEvents, setEligibleEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      // Charger les certificats existants
      const { certificates: myCerts } = await certificatesAPI.getMyCertificates();
      setCertificates(myCerts);

      // Charger les événements éligibles (où on était présent mais pas encore de certificat)
      // Note: Cette logique peut être ajustée selon votre backend
      // Pour l'instant, on montre juste les certificats existants
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (eventId: string) => {
    setGenerating(eventId);
    try {
      await certificatesAPI.generate(eventId);
      toast.success('Certificat généré avec succès ! 🎉');
      loadData();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de la génération';
      toast.error(message);
    } finally {
      setGenerating(null);
    }
  };

  const handleDownload = (certificate: any) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${certificate.pdfUrl}`;
    window.open(url, '_blank');
  };

  if (authLoading || loading) return <Loading />;
  if (!isAuthenticated) return null;

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
            <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">💡 Comment obtenir un certificat ?</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Inscrivez-vous à un événement</li>
                <li>Participez et faites valider votre présence (check-in)</li>
                <li>Après l'événement, générez votre certificat ici</li>
              </ul>
            </div>
          </div>
        </div>

        {certificates.length === 0 ? (
          <div className="card text-center py-16">
            <Award className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              Aucun certificat
            </h3>
            <p className="text-secondary-600 mb-6">
              Participez à des événements pour obtenir vos certificats
            </p>
            <button
              onClick={() => router.push('/events')}
              className="btn-primary"
            >
              Voir les événements
            </button>
          </div>
        ) : (
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
                    {format(new Date(certificate.event?.startDate), 'dd MMMM yyyy', { locale: fr })}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                    {certificate.event?.location}
                  </div>
                </div>

                <div className="border-t border-secondary-200 pt-4 mt-4">
                  <div className="flex justify-between items-center text-xs text-secondary-500 mb-3">
                    <div>N° {certificate.certificateNumber}</div>
                    <div>Émis le {format(new Date(certificate.issuedDate), 'dd/MM/yyyy', { locale: fr })}</div>
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
        )}

        {/* Section Événements Éligibles (si vous avez cette logique) */}
        {eligibleEvents.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">
              Certificats à Générer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eligibleEvents.map((event) => (
                <div key={event.id} className="card">
                  <h3 className="text-lg font-bold text-secondary-900 mb-3">
                    {event.title}
                  </h3>
                  <div className="space-y-2 text-sm text-secondary-600 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-primary-500" />
                      {format(new Date(event.startDate), 'dd MMMM yyyy', { locale: fr })}
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
      </div>
    </div>
  );
}
