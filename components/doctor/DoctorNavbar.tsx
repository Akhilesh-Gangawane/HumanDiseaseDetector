'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Menu, X, User, Settings, LogOut, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useDoctorState } from './DoctorStateContext';

export default function DoctorNavbar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();
    const { notifications } = useDoctorState();

    const doctorName = status === 'loading' ? '...' : (session?.user?.name ?? 'Doctor');
    const doctorEmail = session?.user?.email ?? '';
    const doctorImage = session?.user?.image ?? null;

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNavClick = (tabId: string) => {
        setActiveTab(tabId);
        setMobileMenuOpen(false);
    };

    const handleLogout = () => {
        signOut({ callbackUrl: '/login' });
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <button type="button" onClick={() => handleNavClick('dashboard')} className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 p-0.5 shadow-md transform group-hover:scale-110 transition-transform duration-300">
                            <div className="w-full h-full rounded-full bg-white p-1.5 flex items-center justify-center">
                                <Image src="/logo.png" alt="Dhanvantari AI Logo" width={24} height={24} className="object-contain" />
                            </div>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                            Dhanvantari AI
                        </span>
                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-full bg-blue-50">
                            Doctor
                        </span>
                    </button>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <button type="button" onClick={() => handleNavClick('dashboard')} className={`font-medium transition-colors duration-200 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                            Dashboard
                        </button>
                        <button type="button" onClick={() => handleNavClick('patients')} className={`font-medium transition-colors duration-200 ${activeTab === 'patients' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                            Patients
                        </button>
                        <button type="button" onClick={() => handleNavClick('appointments')} className={`font-medium transition-colors duration-200 ${activeTab === 'appointments' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                            Appointments
                        </button>

                        <button type="button" onClick={() => handleNavClick('notifications')} className={`relative p-2 rounded-lg transition-colors ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`} aria-label="Notifications">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>

                        <div className="relative">
                            <button type="button" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center overflow-hidden">
                                    {doctorImage
                                        ? <Image src={doctorImage} alt={doctorName} width={32} height={32} className="object-cover w-full h-full rounded-full" />
                                        : <User className="w-5 h-5 text-white" />}
                                </div>
                                <span className="text-sm font-medium text-gray-700">{doctorName}</span>
                            </button>

                            {profileDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 backdrop-blur-md bg-white/90 rounded-xl shadow-lg border border-white/20 py-2 animate-fade-in">
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <p className="text-sm font-semibold text-gray-800">{doctorName}</p>
                                        <p className="text-xs text-gray-600">{doctorEmail}</p>
                                    </div>
                                    <button type="button" onClick={() => { handleNavClick('profile'); setProfileDropdownOpen(false); }} className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition-colors">
                                        <User className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm text-gray-700">My Profile</span>
                                    </button>
                                    <button type="button" onClick={() => { handleNavClick('settings'); setProfileDropdownOpen(false); }} className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition-colors">
                                        <Settings className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm text-gray-700">Settings</span>
                                    </button>
                                    <hr className="my-2 border-gray-200" />
                                    <button type="button" onClick={handleLogout} className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-red-50 transition-colors text-red-600">
                                        <LogOut className="w-4 h-4" />
                                        <span className="text-sm">Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Toggle menu">
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden backdrop-blur-md bg-white/90 border-t border-white/20">
                    <div className="px-4 py-4 space-y-3">
                        <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center overflow-hidden">
                                {doctorImage
                                    ? <Image src={doctorImage} alt={doctorName} width={40} height={40} className="object-cover w-full h-full rounded-full" />
                                    : <User className="w-6 h-6 text-white" />}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{doctorName}</p>
                                <p className="text-xs text-gray-600">{doctorEmail}</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => handleNavClick('dashboard')} className={`block w-full text-left py-2 font-medium ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>Dashboard</button>
                        <button type="button" onClick={() => handleNavClick('patients')} className={`block w-full text-left py-2 font-medium ${activeTab === 'patients' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>Patients</button>
                        <button type="button" onClick={() => handleNavClick('appointments')} className={`block w-full text-left py-2 font-medium ${activeTab === 'appointments' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>Appointments</button>
                        <button type="button" onClick={() => handleNavClick('notifications')} className={`block w-full text-left py-2 font-medium ${activeTab === 'notifications' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>Notifications</button>
                        <hr className="border-gray-200" />
                        <button type="button" onClick={() => handleNavClick('profile')} className="flex w-full items-center space-x-2 py-2 text-gray-700 hover:text-blue-600 transition-colors">
                            <User className="w-4 h-4" /><span className="font-medium">My Profile</span>
                        </button>
                        <button type="button" onClick={() => handleNavClick('settings')} className="flex w-full items-center space-x-2 py-2 text-gray-700 hover:text-blue-600 transition-colors">
                            <Settings className="w-4 h-4" /><span className="font-medium">Settings</span>
                        </button>
                        <button type="button" onClick={handleLogout} className="flex w-full items-center space-x-2 py-2 text-red-600 hover:text-red-700 transition-colors">
                            <LogOut className="w-4 h-4" /><span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
