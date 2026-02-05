'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Calendar, Users, Award, BarChart3, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary-200 rounded-full animate-spin border-t-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/30 to-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 backdrop-blur-sm bg-white/80 border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                EventHub
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="btn-secondary">
                Connexion
              </Link>
              <Link href="/auth/register" className="btn-primary">
                Inscription gratuite
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium shadow-sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Plateforme #1 de gestion d'événements
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-secondary-900 leading-tight">
                Organisez des événements
                <span className="block bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 bg-clip-text text-transparent mt-2">
                  inoubliables
                </span>
              </h1>
              
              <p className="text-xl text-secondary-600 leading-relaxed">
                EventHub simplifie la gestion de vos conférences, séminaires et événements. 
                De l'inscription des participants à la délivrance des certificats, tout est centralisé.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register" className="btn-primary inline-flex items-center justify-center text-lg py-3.5 px-8">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="/auth/login" className="btn-outline inline-flex items-center justify-center text-lg py-3.5 px-8">
                  Se connecter
                </Link>
              </div>
              
              <div className="flex items-center space-x-8 pt-6 border-t border-secondary-200">
                <div>
                  <div className="text-3xl font-bold text-secondary-900">10K+</div>
                  <div className="text-sm text-secondary-600 mt-1">Événements</div>
                </div>
                <div className="h-12 w-px bg-secondary-200"></div>
                <div>
                  <div className="text-3xl font-bold text-secondary-900">50K+</div>
                  <div className="text-sm text-secondary-600 mt-1">Participants</div>
                </div>
                <div className="h-12 w-px bg-secondary-200"></div>
                <div>
                  <div className="text-3xl font-bold text-secondary-900">98%</div>
                  <div className="text-sm text-secondary-600 mt-1">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Right Visual - Mock Dashboard */}
            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 border-2 border-secondary-100">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-secondary-900">Tableau de bord</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white shadow-lg">
                      <Calendar className="h-8 w-8 mb-3 opacity-90" />
                      <div className="text-2xl font-bold">24</div>
                      <div className="text-sm opacity-90 mt-1">Événements</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                      <Users className="h-8 w-8 mb-3 opacity-90" />
                      <div className="text-2xl font-bold">1.2K</div>
                      <div className="text-sm opacity-90 mt-1">Participants</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {['Tech Conference 2026', 'Workshop IA', 'Séminaire Marketing'].map((event, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg border border-secondary-100 hover:border-primary-200 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            i === 0 ? 'bg-primary-500' : i === 1 ? 'bg-green-500' : 'bg-blue-500'
                          }`}></div>
                          <span className="text-sm font-medium text-secondary-700">{event}</span>
                        </div>
                        <span className="text-xs text-secondary-500">{[500, 120, 89][i]} inscrits</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '700ms'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-secondary-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Une solution complète pour gérer chaque aspect de vos événements professionnels
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Calendar, title: 'Gestion d\'événements', desc: 'Créez et gérez facilement', color: 'from-primary-500 to-primary-600' },
              { icon: Users, title: 'Inscription en ligne', desc: 'Système simple et rapide', color: 'from-green-500 to-green-600' },
              { icon: BarChart3, title: 'Analytics temps réel', desc: 'Suivez vos KPIs', color: 'from-blue-500 to-blue-600' },
              { icon: Award, title: 'Certificats auto', desc: 'PDF personnalisés', color: 'from-purple-500 to-purple-600' },
            ].map((feature, i) => (
              <div key={i} className="text-center group">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">{feature.title}</h3>
                <p className="text-secondary-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à transformer vos événements ?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'organisateurs qui font déjà confiance à EventHub pour gérer leurs événements
          </p>
          <Link href="/auth/register" className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-all shadow-2xl hover:shadow-xl hover:scale-105">
            Créer un compte gratuit
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">EventHub</span>
            </div>
            <p className="text-secondary-400 mb-6">
              La plateforme professionnelle de gestion d'événements
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-secondary-400">
              <span>© 2026 EventHub</span>
              <span>•</span>
              <span>Tous droits réservés</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
