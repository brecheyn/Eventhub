'use client';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 rounded-full animate-spin border-t-primary-600 mx-auto"></div>
        </div>
        <p className="mt-4 text-secondary-600 font-medium">Chargement...</p>
      </div>
    </div>
  );
}
