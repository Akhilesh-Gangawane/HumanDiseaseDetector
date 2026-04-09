'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, Mic, Camera, Activity, Settings,
  Users, Calendar, MessageSquare, Loader2
} from 'lucide-react';
import { useDoctorState } from './DoctorStateContext';
import { openGoogleMeet } from '@/lib/videosdk';

export default function ConsultDoctor() {
  const { appointments } = useDoctorState();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const upcomingAppointments = appointments.filter(apt => apt.mode === 'Online');

  return (
    <div className="w-full p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Video className="w-4 h-4" /> Next-Gen Telehealth
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Telemedicine <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Hub</span></h1>
          <p className="text-gray-500 text-base">Manage virtual consultations with real-time patient telemetry.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right mr-4 hidden md:block">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Current Time</p>
            <p className="text-2xl font-bold text-gray-900">{currentTime || 'Loading...'}</p>
          </div>
          <button type="button" onClick={openGoogleMeet} className="group relative px-6 py-4 bg-gray-900 text-white font-bold rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-3">
              <Video className="w-5 h-5" />
              Start Video Call
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Users, label: "Today's Patients", value: '12', bg: 'bg-indigo-100', text: 'text-indigo-600', hover: 'bg-indigo-50' },
              { icon: Activity, label: 'Connection Stability', value: '98%', bg: 'bg-emerald-100', text: 'text-emerald-600', hover: 'bg-emerald-50' },
              { icon: Calendar, label: 'Average Rating', value: '4.9', bg: 'bg-purple-100', text: 'text-purple-600', hover: 'bg-purple-50' },
            ].map(({ icon: Icon, label, value, bg, text, hover }) => (
              <div key={label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className={`absolute -right-6 -top-6 w-24 h-24 ${hover} rounded-full group-hover:scale-150 transition-transform duration-500 ease-out`} />
                <div className="relative">
                  <div className={`w-12 h-12 ${bg} ${text} rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-1">{value}</h3>
                  <p className="text-gray-500 font-medium">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Today&apos;s Schedule</h2>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button type="button" onClick={() => setActiveTab('upcoming')} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === 'upcoming' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Upcoming</button>
                <button type="button" onClick={() => setActiveTab('past')} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === 'past' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Past</button>
              </div>
            </div>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {upcomingAppointments.map((apt, idx) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={apt.id} className="p-5 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {apt.patientName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-700 transition-colors">{apt.patientName}</h3>
                        <p className="text-gray-500 text-sm font-medium">{apt.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 sm:gap-8 justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                      <div className="text-left sm:text-right">
                        <p className="text-gray-900 font-bold">{apt.time}</p>
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1 ${apt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : apt.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {apt.status}
                        </span>
                      </div>
                      <button type="button" onClick={openGoogleMeet} aria-label={`Start video call with ${apt.patientName}`} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${idx === 0 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 group-hover:scale-110' : 'bg-gray-100 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                        <Video className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 text-white border border-gray-800 shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full" />
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" /> Equipment Readiness
            </h3>
            <div className="space-y-4 relative z-10">
              {[
                { icon: Camera, label: 'FaceTime HD Camera', desc: 'Connected • 1080p', ok: true },
                { icon: Mic, label: 'Studio Microphone', desc: 'Connected • Levels OK', ok: true },
                { icon: Activity, label: 'Network Latency', desc: '45ms • Minor jitter', ok: false },
              ].map(({ icon: Icon, label, desc, ok }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${ok ? 'bg-emerald-500/20' : 'bg-yellow-500/20'} rounded-xl ${ok ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${ok ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                </div>
              ))}
            </div>
            <button type="button" className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl font-semibold text-sm border border-white/5">
              Run Diagnostics
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 flex-1 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Before the call</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <p>Review <span className="font-bold text-gray-900">Eleanor Pena&apos;s</span> latest lab results uploaded at 8:00 AM.</p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <p>Check telemetry sync status with the patient&apos;s wearable device.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
