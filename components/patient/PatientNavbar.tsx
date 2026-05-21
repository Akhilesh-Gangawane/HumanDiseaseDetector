'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, User, Settings, LogOut, Bell, Shield, ChevronDown, Home, Stethoscope, Brain, FileText, Calendar } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { usePatientStateSafe } from '@/components/patient/PatientStateContext';

const NAV_LINKS = [
  { label: 'Home', href: '/patient-dashboard', icon: Home },
  { label: 'Disease Prediction', href: '/disease-prediction', icon: Brain },
  { label: 'Consult Doctor', href: '/consult-doctor', icon: Stethoscope },
  { label: 'Health Records', href: '/patient-dashboard/records', icon: FileText },
  { label: 'Appointments', href: '/patient-dashboard/appointments', icon: Calendar },
];

export default function PatientNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { unreadCount } = usePatientStateSafe();

  const userName = status === 'loading' ? '...' : (session?.user?.name ?? 'Guest');
  const userEmail = session?.user?.email ?? '';
  const userImage = session?.user?.image ?? null;

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link href="/patient-dashboard" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 p-0.5 shadow-md group-hover:scale-110 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-white p-1.5 flex items-center justify-center">
                <Image src="/logo.png" alt="Dhanvantari AI" width={22} height={22} className="object-contain" />
              </div>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent whitespace-nowrap">
              Dhanvantari AI
            </span>
          </Link>

          {/* Desktop nav links — centered */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map(({ label, href, icon: Icon }) => (
              <button
                key={href}
                type="button"
                onClick={() => router.push(href)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive(href)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {/* Health Policy */}
            <button
              type="button"
              onClick={() => router.push('/health-policy')}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-lg hover:shadow-md hover:scale-105 transition-all duration-200"
            >
              <Shield className="w-4 h-4" />
              <span>Health Policy</span>
            </button>

            {/* Notifications */}
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => router.push('/patient-dashboard/notifications')}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                  {userImage
                    ? <Image src={userImage} alt={userName} width={32} height={32} className="object-cover w-full h-full rounded-full" />
                    : <User className="w-4 h-4 text-white" />}
                </div>
                <span className="text-sm font-medium text-gray-700">{userName}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{userName}</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  </div>
                  <Link href="/patient-dashboard/profile" onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <User className="w-4 h-4 text-gray-400" /> My Profile
                  </Link>
                  <Link href="/patient-dashboard/settings" onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" /> Settings
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <Link href="/login" onClick={() => { setProfileOpen(false); signOut({ callbackUrl: '/login' }); }}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" /> Logout
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {/* User info */}
            <div className="flex items-center gap-3 p-3 mb-2 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                {userImage
                  ? <Image src={userImage} alt={userName} width={40} height={40} className="object-cover w-full h-full rounded-full" />
                  : <User className="w-5 h-5 text-white" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{userName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
            </div>

            {/* Nav links */}
            {NAV_LINKS.map(({ label, href, icon: Icon }) => (
              <button
                key={href}
                type="button"
                onClick={() => { router.push(href); setMobileOpen(false); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}

            <hr className="border-gray-100 my-2" />

            {/* Health Policy */}
            <button
              type="button"
              onClick={() => { router.push('/health-policy'); setMobileOpen(false); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-medium"
            >
              <Shield className="w-4 h-4" /> Health Policy
            </button>

            {/* Notifications */}
            <button
              type="button"
              onClick={() => { router.push('/patient-dashboard/notifications'); setMobileOpen(false); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Bell className="w-4 h-4" /> Notifications
              {unreadCount > 0 && (
                <span className="ml-auto min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <hr className="border-gray-100 my-2" />

            <Link href="/patient-dashboard/profile" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <User className="w-4 h-4 text-gray-400" /> My Profile
            </Link>
            <Link href="/patient-dashboard/settings" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Settings className="w-4 h-4 text-gray-400" /> Settings
            </Link>
            <Link href="/login" onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/login' }); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
