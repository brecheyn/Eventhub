'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { User, Calendar, Users, Award, LayoutDashboard, Scan } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white border-b-2 border-secondary-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/dashboard" className="flex items-center group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                EventHub
              </span>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-secondary-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
              
              <Link
                href="/events"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-secondary-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Événements
              </Link>

              <Link
                href="/tickets/my-tickets"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-secondary-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              >
                <Award className="h-4 w-4 mr-2" />
                Mes Tickets
              </Link>
              
              {(user?.role === 'admin' || user?.role === 'organizer') && (
                <>
                  <Link
                    href="/participants"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-secondary-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Participants
                  </Link>

                  <Link
                    href="/checkin"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-secondary-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                  >
                    <Scan className="h-4 w-4 mr-2" />
                    Check-in
                  </Link>
                </>
              )}
              
              <Link
                href="/certificates"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-secondary-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              >
                <Award className="h-4 w-4 mr-2" />
                Certificats
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            <Link
              href="/profile"
              className="flex items-center px-3 py-1.5 bg-secondary-50 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-2">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-secondary-900">{user?.name}</div>
                <div className="text-xs text-secondary-500 capitalize">{user?.role}</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
