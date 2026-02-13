"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Loading from "@/components/ui/Loading";
import { eventsAPI } from "@/lib/api/events";
import { EVENT_TYPES } from "@/lib/constants/eventTypes";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  FileText,
  Save,
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";

export default function EditEventPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "conference",
    startDate: "",
    endDate: "",
    location: "",
    venue: "",
    maxCapacity: 100,
    ticketPrice: 0,
    isFree: true,
    status: "draft" as "draft" | "published" | "cancelled",
  });

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const { event } = await eventsAPI.getById(eventId);

      // Vérifier les permissions
      if (user?.role !== "admin" && event.organizerId !== user?.id) {
        toast.error(
          "Vous n'avez pas les permissions pour modifier cet événement",
        );
        router.push("/events");
        return;
      }

      // Convertir les dates pour l'input datetime-local
      const startDate = new Date(event.startDate).toISOString().slice(0, 16);
      const endDate = new Date(event.endDate).toISOString().slice(0, 16);

      setFormData({
        title: event.title,
        description: event.description || "",
        eventType: event.eventType || "conference",
        startDate,
        endDate,
        location: event.location,
        venue: event.venue || "",
        maxCapacity: event.maxCapacity,
        ticketPrice: event.ticketPrice,
        isFree: event.isFree,
        status: event.status,
      });

      // Charger l'image actuelle
      if (event.imageUrl) {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        setCurrentImageUrl(`${API_URL}${event.imageUrl}`);
      }
    } catch (error) {
      toast.error("Événement introuvable");
      router.push("/events");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (5 MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5 MB");
        return;
      }

      // Vérifier le type
      if (!file.type.startsWith("image/")) {
        toast.error("Veuillez sélectionner une image");
        return;
      }

      setImageFile(file);

      // Créer la prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData = {
        ...formData,
        image: imageFile,
      };

      await eventsAPI.update(eventId, submitData);
      toast.success("Événement modifié avec succès ! ");
      router.push(`/events/${eventId}`);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la modification",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  const displayImage = imagePreview || currentImageUrl;

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
            Modifier l'événement
          </h1>
          <p className="mt-2 text-secondary-600">
            Modifiez les informations de votre événement
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="card">
            <h2 className="text-xl font-bold text-secondary-900 mb-6 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2 text-primary-600" />
              Image de l'événement
            </h2>

            <div className="space-y-4">
              {displayImage ? (
                <div className="relative">
                  <Image
                    src={displayImage}
                    alt="Aperçu"
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-secondary-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label htmlFor="image" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-secondary-400 mb-4" />
                    <p className="text-secondary-600 mb-2">
                      Cliquez pour uploader ou glissez-déposez
                    </p>
                    <p className="text-sm text-secondary-500">
                      PNG, JPG, GIF jusqu'à 5MB
                    </p>
                  </label>
                </div>
              )}
            </div>
          </div>

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
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="input-field"
                  placeholder="Ex: Conférence Tech 2026"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Type d'événement *
                </label>
                <select
                  required
                  value={formData.eventType}
                  onChange={(e) =>
                    setFormData({ ...formData, eventType: e.target.value })
                  }
                  className="input-field"
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
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
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
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
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="input-field pl-10"
                    placeholder="Ex: Paris, France"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Lieu précis
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) =>
                    setFormData({ ...formData, venue: e.target.value })
                  }
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxCapacity: parseInt(e.target.value),
                      })
                    }
                    className="input-field pl-10"
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
                        isFree: price === 0,
                      });
                    }}
                    className="input-field pl-10"
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isFree: e.target.checked,
                      ticketPrice: e.target.checked ? 0 : formData.ticketPrice,
                    })
                  }
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
              Statut de Publication
            </h2>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Statut de l'événement
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
                className="input-field"
              >
                <option value="draft">Brouillon (non visible)</option>
                <option value="published">Publié (visible par tous)</option>
                <option value="cancelled">Annulé</option>
              </select>
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
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Sauvegarder les modifications
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
