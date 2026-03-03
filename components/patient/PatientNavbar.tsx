'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, User, Settings, LogOut, Bell } from 'lucide-react';

export default function PatientNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/patient-dashboard" className="flex items-center space-x-2 group">
            <div className="relative w-10 h-10 transform group-hover:scale-110 transition-transform duration-300">
              <Image 
                src="/logo.png" 
                alt="Dhanvantari AI Logo" 
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Dhanvantari AI
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/patient-dashboard" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
              Home
            </Link>
            <Link href="#prediction" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
              Disease Prediction
            </Link>
            <Link href="#consult" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
              Consult Doctor
            </Link>
            <Link href="#pathology" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
              Pathology
            </Link>
            <Link href="#knowledge" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
              Knowledge
            </Link>
            
            {/* Notification Icon */}
            <button 
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">John Doe</span>
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 backdrop-blur-md bg-white/90 rounded-xl shadow-lg border border-white/20 py-2 animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-800">John Doe</p>
                    <p className="text-xs text-gray-600">john.doe@email.com</p>
                  </div>
                  <Link
                    href="#profile"
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">My Profile</span>
                  </Link>
                  <Link
                    href="#settings"
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Settings</span>
                  </Link>
                  <hr className="my-2 border-gray-200" />
                  <Link
                    href="/login"
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-red-50 transition-colors text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden backdrop-blur-md bg-white/90 border-t border-white/20">
          <div className="px-4 py-4 space-y-3">
            {/* User Info */}
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">John Doe</p>
                <p className="text-xs text-gray-600">john.doe@email.com</p>
              </div>
            </div>
            
            <Link href="/patient-dashboard" className="block text-gray-700 hover:text-blue-600 transition-colors py-2 font-medium">
              Home
            </Link>
            <Link href="#prediction" className="block text-gray-700 hover:text-blue-600 transition-colors py-2 font-medium">
              Disease Prediction
            </Link>
            <Link href="#consult" className="block text-gray-700 hover:text-blue-600 transition-colors py-2 font-medium">
              Consult Doctor
            </Link>
            <Link href="#pathology" className="block text-gray-700 hover:text-blue-600 transition-colors py-2 font-medium">
              Pathology
            </Link>
            <Link href="#knowledge" className="block text-gray-700 hover:text-blue-600 transition-colors py-2 font-medium">
              Knowledge
            </Link>
            
            <hr className="border-gray-200" />
            
            <Link href="#profile" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-600 transition-colors">
              <User className="w-4 h-4" />
              <span className="font-medium">My Profile</span>
            </Link>
            <Link href="#settings" className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-600 transition-colors">
              <Settings className="w-4 h-4" />
              <span className="font-medium">Settings</span>
            </Link>
            <Link href="/login" className="flex items-center space-x-2 py-2 text-red-600 hover:text-red-700 transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
