"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Loading from "@/components/ui/Loading";
import { authAPI } from "@/lib/api/auth";
import {
  User,
  Mail,
  Phone,
  Building,
  Shield,
  Save,
  LogOut,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        organization: user.organization || "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.updateProfile(formData);
      toast.success("Profil mis à jour avec succès ! ");

      // Recharger les données utilisateur
      window.location.reload();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la mise à jour",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Mot de passe modifié avec succès ! ");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors du changement de mot de passe",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    const confirmation = prompt(
      '⚠️ ATTENTION ! Cette action est IRRÉVERSIBLE.\n\nTapez "SUPPRIMER" pour confirmer la suppression définitive de votre compte :',
    );

    if (confirmation !== "SUPPRIMER") {
      toast.error("Suppression annulée");
      setShowDeleteConfirm(false);
      return;
    }

    setLoading(true);

    try {
      await authAPI.deleteAccount();
      toast.success("Compte supprimé. Au revoir ");
      logout();
      router.push("/");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la suppression",
      );
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
      toast.success("Déconnexion réussie");
      router.push("/auth/login");
    }
  };

  if (authLoading) return <Loading />;
  if (!isAuthenticated || !user) return null;

  const getRoleBadge = (role: string) => {
    const badges: any = {
      admin: { class: "badge-danger", label: "Administrateur" },
      organizer: { class: "badge-info", label: "Organisateur" },
      participant: { class: "badge-success", label: "Participant" },
    };
    return badges[role] || badges.participant;
  };

  const roleBadge = getRoleBadge(user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-secondary-50/50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 flex items-center">
            <User className="h-8 w-8 mr-3 text-primary-600" />
            Mon Profil
          </h1>
          <p className="mt-2 text-secondary-600">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Card */}
            <div className="card text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900 mb-2">
                {user.name}
              </h2>
              <p className="text-sm text-secondary-600 mb-3">{user.email}</p>
              <span
                className={`badge ${roleBadge.class} inline-flex items-center`}
              >
                <Shield className="h-3 w-3 mr-1" />
                {roleBadge.label}
              </span>
            </div>

            {/* Account Info */}
            <div className="card">
              <h3 className="text-lg font-bold text-secondary-900 mb-4">
                Informations du compte
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-secondary-500">Membre depuis</div>
                  <div className="font-medium text-secondary-900">
                    {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-secondary-500">Statut</div>
                  <div className="font-medium text-green-600">
                    {user.isActive ? "✓ Actif" : "✗ Inactif"}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full btn-secondary inline-flex items-center justify-center"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Se déconnecter
              </button>

              <button
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="w-full btn-danger inline-flex items-center justify-center"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Supprimer mon compte
              </button>
            </div>

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
              <div className="card bg-red-50 border-2 border-red-200">
                <div className="flex items-start mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-900 mb-1">
                      ⚠️ Action irréversible
                    </h4>
                    <p className="text-sm text-red-800 mb-3">
                      La suppression de votre compte entraînera :
                    </p>
                    <ul className="text-xs text-red-700 space-y-1 mb-3">
                      <li>• Suppression de toutes vos données</li>
                      <li>• Annulation de vos inscriptions</li>
                      <li>• Perte de vos certificats</li>
                      <li>• Action définitive et irréversible</li>
                    </ul>
                  </div>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? "Suppression..." : "Confirmer la suppression"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full mt-2 btn-secondary text-sm"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Form */}
            <div className="card">
              <h3 className="text-xl font-bold text-secondary-900 mb-6 flex items-center">
                <User className="h-5 w-5 mr-2 text-primary-600" />
                Informations Personnelles
              </h3>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Nom complet *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="input-field pl-10"
                      placeholder={user.name}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="input-field pl-10"
                      placeholder={user.email}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="input-field pl-10"
                      placeholder={user.phone || "+33 6 12 34 56 78"}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Organisation
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organization: e.target.value,
                        })
                      }
                      className="input-field pl-10"
                      placeholder={
                        user.organization || "Nom de votre entreprise"
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary inline-flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Enregistrer les modifications
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Section */}
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-secondary-900 flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-primary-600" />
                  Sécurité
                </h3>
                {!showPasswordForm && (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="btn-secondary text-sm"
                  >
                    Changer le mot de passe
                  </button>
                )}
              </div>

              {showPasswordForm ? (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Mot de passe actuel *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        required
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="input-field pl-10 pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            current: !showPasswords.current,
                          })
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Nouveau mot de passe *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        required
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className="input-field pl-10 pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            new: !showPasswords.new,
                          })
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-secondary-500">
                      Minimum 6 caractères
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Confirmer le mot de passe *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        required
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="input-field pl-10 pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            confirm: !showPasswords.confirm,
                          })
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                      className="btn-secondary"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary inline-flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Modification...
                        </>
                      ) : (
                        <>
                          <Lock className="h-5 w-5 mr-2" />
                          Changer le mot de passe
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-sm text-secondary-600">
                  <p>• Utilisez un mot de passe fort et unique</p>
                  <p>• Minimum 6 caractères</p>
                  <p>• Ne partagez jamais votre mot de passe</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
