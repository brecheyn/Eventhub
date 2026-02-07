'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Calendar, 
  Users, 
  Award, 
  LayoutDashboard, 
  Scan, 
  Menu, 
  X 
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) return null;

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['all'] },
    { href: '/events', label: 'Événements', icon: Calendar, roles: ['all'] },
    { href: '/tickets/my-tickets', label: 'Mes Tickets', icon: Award, roles: ['all'] },
    { href: '/participants', label: 'Participants', icon: Users, roles: ['admin', 'organizer'] },
    { href: '/checkin', label: 'Check-in', icon: Scan, roles: ['admin', 'organizer'] },
    { href: '/certificates', label: 'Certificats', icon: Award, roles: ['all'] },
  ];

  const visibleLinks = navLinks.filter(link => 
    link.roles.includes('all') || link.roles.includes(user?.role || '')
  );

  return (
    <nav className="bg-white border-b-2 border-secondary-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent hidden sm:block">
                EventHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive(link.href)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-secondary-700 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side - Desktop */}
          <div className="hidden md:flex md:items-center">
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

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-secondary-700 hover:text-primary-600 hover:bg-primary-50 transition-all"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-secondary-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Profile on mobile */}
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-3 py-3 rounded-lg mb-2 ${
                isActive('/profile')
                  ? 'bg-primary-50 border-2 border-primary-200'
                  : 'bg-secondary-50 border-2 border-secondary-200'
              }`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-3">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-medium text-secondary-900">{user?.name}</div>
                <div className="text-xs text-secondary-500 capitalize">{user?.role}</div>
              </div>
            </Link>

            {/* Navigation links */}
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-3 text-base font-medium rounded-lg transition-all ${
                    isActive(link.href)
                      ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-600'
                      : 'text-secondary-700 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
