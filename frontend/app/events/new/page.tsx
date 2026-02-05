'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { eventsAPI } from '@/lib/api/events';
import { Calendar, MapPin, Users, DollarSign, FileText, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function NewEventPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    venue: '',
    maxCapacity: 100,
    ticketPrice: 0,
    isFree: true,
    status: 'draft' as 'draft' | 'published',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { event } = await eventsAPI.create(formData);
      toast.success('Événement créé avec succès ! 🎉');
      router.push(`/events/${event.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'organizer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-secondary-50/50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
          <p className="text-secondary-600 mb-6">Vous n'avez pas les permissions pour créer des événements.</p>
          <Link href="/dashboard" className="btn-primary">
            Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-secondary-50/50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/events" className="inline-flex items-center text-secondary-600 hover:text-primary-600 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux événements
          </Link>
          <h1 className="text-3xl font-bold text-secondary-900 flex items-center">
            <Calendar className="h-8 w-8 mr-3 text-primary-600" />
            Créer un événement
          </h1>
          <p className="mt-2 text-secondary-600">
            Remplissez les informations pour créer votre événement
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="card">
            <h2 className="text-xl font-bold text-secondary-900 mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary-600" />
              Informations de base
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Titre de l'événement *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Conférence Tech 2026"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={4}
                  placeholder="Décrivez votre événement..."
                />
              </div>
            </div>
          </div>

          {/* Dates et Lieu */}
          <div className="card">
            <h2 className="text-xl font-bold text-secondary-900 mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary-600" />
              Dates et Lieu
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Date de début *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Date de fin *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Ville / Lieu *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field pl-10"
                    placeholder="Ex: Paris, France"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Lieu précis (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Palais des Congrès"
                />
              </div>
            </div>
          </div>

          {/* Capacité et Tarif */}
          <div className="card">
            <h2 className="text-xl font-bold text-secondary-900 mb-6 flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary-600" />
              Capacité et Tarification
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Capacité maximale *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                    className="input-field pl-10"
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Prix du ticket (€)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.ticketPrice}
                    onChange={(e) => {
                      const price = parseFloat(e.target.value);
                      setFormData({ 
                        ...formData, 
                        ticketPrice: price,
                        isFree: price === 0
                      });
                    }}
                    className="input-field pl-10"
                    placeholder="0.00"
                    disabled={formData.isFree}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isFree}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    isFree: e.target.checked,
                    ticketPrice: e.target.checked ? 0 : formData.ticketPrice
                  })}
                  className="w-5 h-5 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-secondary-700">
                  Événement gratuit
                </span>
              </label>
            </div>
          </div>

          {/* Statut */}
          <div className="card">
            <h2 className="text-xl font-bold text-secondary-900 mb-6">
              Publication
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Statut de l'événement
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="input-field"
                >
                  <option value="draft">Brouillon (non visible)</option>
                  <option value="published">Publié (visible par tous)</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Astuce :</strong> Vous pouvez créer l'événement en brouillon et le publier plus tard.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link href="/events" className="btn-secondary">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary inline-flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Création...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Créer l'événement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
