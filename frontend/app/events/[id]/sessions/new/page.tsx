"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { sessionsAPI } from "@/lib/api/sessions";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  Save,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function NewSessionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    speaker: "",
    room: "",
    startTime: "",
    endTime: "",
    capacity: 50,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await sessionsAPI.create(eventId, formData);
      toast.success("Session créée avec succès ! ");
      router.push(`/events/${eventId}`);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la création",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-secondary-50/50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href={`/events/${eventId}`}
            className="inline-flex items-center text-secondary-600 hover:text-primary-600 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'événement
          </Link>
          <h1 className="text-3xl font-bold text-secondary-900 flex items-center">
            <Calendar className="h-8 w-8 mr-3 text-primary-600" />
            Créer une session
          </h1>
          <p className="mt-2 text-secondary-600">
            Ajoutez une nouvelle session à votre événement
          </p>
        </div>

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
                  Titre de la session *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="input-field"
                  placeholder="Ex: Conférence sur l'IA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input-field"
                  rows={4}
                  placeholder="Décrivez le contenu de la session..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Intervenant
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                  <input
                    type="text"
                    value={formData.speaker}
                    onChange={(e) =>
                      setFormData({ ...formData, speaker: e.target.value })
                    }
                    className="input-field pl-10"
                    placeholder="Nom de l'intervenant"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Salle
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) =>
                      setFormData({ ...formData, room: e.target.value })
                    }
                    className="input-field pl-10"
                    placeholder="Ex: Salle A, Amphithéâtre 1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Horaires et Capacité */}
          <div className="card">
            <h2 className="text-xl font-bold text-secondary-900 mb-6 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary-600" />
              Horaires et Capacité
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Heure de début *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Heure de fin *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Capacité maximale
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value),
                    })
                  }
                  className="input-field"
                  placeholder="50"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link href={`/events/${eventId}`} className="btn-secondary">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary inline-flex items-center"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Création...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Créer la session
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
