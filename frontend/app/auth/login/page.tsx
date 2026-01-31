'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Calendar, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Connexion réussie ! Bienvenue 🎉');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/30 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow">
                <Calendar className="h-10 w-10 text-white" />
              </div>
            </div>
          </Link>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
            Bon retour !
          </h2>
          <p className="mt-2 text-secondary-600">
            Connectez-vous pour accéder à votre espace
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-secondary-100 p-8 hover:shadow-2xl transition-shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="admin@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-secondary-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-secondary-500 font-medium">
                  Nouveau sur EventHub ?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/auth/register"
                className="w-full btn-secondary block text-center"
              >
                Créer un compte
              </Link>
            </div>
          </div>

          {/* Test Account Info */}
          <div className="mt-6 pt-6 border-t-2 border-secondary-100">
            <p className="text-xs text-center text-secondary-500 mb-2">
              🧪 Compte de test disponible
            </p>
            <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-3">
              <p className="text-xs font-mono text-secondary-700 text-center">
                admin@example.com<br/>
                admin123
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
