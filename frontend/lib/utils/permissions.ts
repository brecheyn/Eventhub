import { isPast } from 'date-fns';

export interface Event {
  id: string;
  organizerId: string;
  status: string;
  startDate: string;
  endDate: string;
  currentCapacity: number;
  maxCapacity: number;
}

export interface User {
  id: string;
  role: 'admin' | 'organizer' | 'participant';
}

// ═══════════════════════════════════════════════════════════
// VÉRIFICATIONS DE PERMISSIONS
// ═══════════════════════════════════════════════════════════

/**
 * Vérifie si l'événement est terminé
 */
export const isEventCompleted = (event: Event): boolean => {
  return isPast(new Date(event.endDate));
};

/**
 * Vérifie si l'événement est en cours
 */
export const isEventOngoing = (event: Event): boolean => {
  const now = new Date();
  return isPast(new Date(event.startDate)) && !isPast(new Date(event.endDate));
};

/**
 * Vérifie si l'utilisateur peut voir cet événement
 * - Admin : Tous les événements
 * - Organizer : Ses événements + événements publiés
 * - Participant : Événements publiés uniquement
 */
export const canViewEvent = (user: User | null, event: Event): boolean => {
  if (!user) return event.status === 'published';
  
  if (user.role === 'admin') return true;
  
  if (user.role === 'organizer') {
    return event.organizerId === user.id || event.status === 'published';
  }
  
  return event.status === 'published';
};

/**
 * Vérifie si l'utilisateur peut modifier cet événement
 * - Admin : Tous les événements
 * - Organizer : UNIQUEMENT ses événements
 * - Participant : Jamais
 */
export const canEditEvent = (user: User | null, event: Event): boolean => {
  if (!user) return false;
  
  if (user.role === 'admin') return true;
  
  if (user.role === 'organizer') {
    return event.organizerId === user.id;
  }
  
  return false;
};

/**
 * Vérifie si l'utilisateur peut supprimer cet événement
 * - Admin : Tous les événements (même terminés)
 * - Organizer : UNIQUEMENT ses événements NON terminés
 * - Participant : Jamais
 */
export const canDeleteEvent = (user: User | null, event: Event): boolean => {
  if (!user) return false;
  
  if (user.role === 'admin') return true;
  
  if (user.role === 'organizer') {
    const isOwner = event.organizerId === user.id;
    const notCompleted = !isEventCompleted(event);
    return isOwner && notCompleted;
  }
  
  return false;
};

/**
 * Vérifie si on peut s'inscrire à cet événement
 * - Événement doit être publié
 * - Événement ne doit PAS être terminé
 * - Événement ne doit PAS être annulé
 * - Places disponibles
 */
export const canRegisterToEvent = (event: Event): boolean => {
  if (event.status !== 'published') return false;
  if (isEventCompleted(event)) return false;
  if (event.status === 'cancelled') return false;
  if (event.currentCapacity >= event.maxCapacity) return false;
  
  return true;
};

/**
 * Vérifie si l'utilisateur peut gérer les participants
 * - Admin : Tous les événements
 * - Organizer : UNIQUEMENT ses événements
 */
export const canManageParticipants = (user: User | null, event: Event): boolean => {
  if (!user) return false;
  
  if (user.role === 'admin') return true;
  
  if (user.role === 'organizer') {
    return event.organizerId === user.id;
  }
  
  return false;
};

/**
 * Vérifie si l'utilisateur peut faire le check-in
 * - Admin : Tous les événements
 * - Organizer : UNIQUEMENT ses événements
 * - Événement doit être en cours ou dans le futur proche
 */
export const canCheckIn = (user: User | null, event: Event): boolean => {
  if (!user) return false;
  if (isEventCompleted(event)) return false;
  
  if (user.role === 'admin') return true;
  
  if (user.role === 'organizer') {
    return event.organizerId === user.id;
  }
  
  return false;
};

/**
 * Obtient le statut réel de l'événement
 */
export const getEventActualStatus = (event: Event): string => {
  if (isPast(new Date(event.endDate))) return 'completed';
  if (isEventOngoing(event)) return 'ongoing';
  if (event.status === 'cancelled') return 'cancelled';
  if (event.status === 'draft') return 'draft';
  return 'published';
};

/**
 * Obtient le message d'impossibilité d'inscription
 */
export const getRegistrationBlockReason = (event: Event): string | null => {
  if (event.status !== 'published') return 'Événement non publié';
  if (isEventCompleted(event)) return 'Événement terminé';
  if (event.status === 'cancelled') return 'Événement annulé';
  if (event.currentCapacity >= event.maxCapacity) return 'Événement complet';
  return null;
};
