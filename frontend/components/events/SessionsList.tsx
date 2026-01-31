'use client';

import { useState, useEffect } from 'react';
import { sessionsAPI } from '@/lib/api/sessions';
import { Clock, User, MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface SessionsListProps {
  eventId: string;
  canEdit: boolean;
}

export default function SessionsList({ eventId, canEdit }: SessionsListProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    speaker: '',
    speakerBio: '',
    startTime: '',
    endTime: '',
    room: '',
    maxAttendees: 0,
  });

  useEffect(() => {
    loadSessions();
  }, [eventId]);

  const loadSessions = async () => {
    try {
      const { sessions: eventSessions } = await sessionsAPI.getByEvent(eventId);
      setSessions(eventSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sessionsAPI.create(eventId, formData);
      toast.success('Session créée avec succès !');
      setShowForm(false);
      resetForm();
      loadSessions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Supprimer cette session ?')) return;
    
    try {
      await sessionsAPI.delete(sessionId);
      toast.success('Session supprimée');
      loadSessions();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      speaker: '',
      speakerBio: '',
      startTime: '',
      endTime: '',
      room: '',
      maxAttendees: 0,
    });
  };

  if (loading) {
    return <div className="text-center py-8 text-secondary-600">Chargement des sessions...</div>;
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-secondary-900">
          Programme ({sessions.length} sessions)
        </h2>
        {canEdit && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-secondary text-sm inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Ajouter une session
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-secondary-50 rounded-xl border-2 border-secondary-200">
          <h3 className="text-lg font-bold text-secondary-900 mb-4">Nouvelle Session</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Titre de la session *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="Ex: Keynote - L'avenir de l'IA"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Description de la session..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Intervenant
              </label>
              <input
                type="text"
                value={formData.speaker}
                onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                className="input-field"
                placeholder="Nom de l'intervenant"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Salle
              </label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="input-field"
                placeholder="Ex: Salle A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Heure de début *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              Créer la session
            </button>
          </div>
        </form>
      )}

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
          <p className="text-secondary-600">Aucune session programmée pour le moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="border-2 border-secondary-100 rounded-xl p-4 hover:border-primary-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-secondary-900 text-lg">
                  {session.title}
                </h3>
                {canEdit && (
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {session.description && (
                <p className="text-sm text-secondary-600 mb-3">
                  {session.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-secondary-600">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-primary-500" />
                  {format(new Date(session.startTime), 'HH:mm', { locale: fr })} - 
                  {format(new Date(session.endTime), 'HH:mm', { locale: fr })}
                </div>
                {session.speaker && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1 text-primary-500" />
                    {session.speaker}
                  </div>
                )}
                {session.room && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-primary-500" />
                    {session.room}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
