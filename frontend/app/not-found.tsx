import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/30 to-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
            404
          </h1>
          <p className="text-2xl font-semibold text-secondary-900 mt-4">
            Page introuvable
          </p>
          <p className="text-secondary-600 mt-2">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <Home className="h-5 w-5 mr-2" />
            Retour à l'accueil
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-secondary-700 border-2 border-secondary-200 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-colors font-medium"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Page précédente
          </button>
        </div>
      </div>
    </div>
  );
}
