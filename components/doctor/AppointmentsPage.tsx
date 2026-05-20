'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle, Plus, Search, Video, MessageSquare } from 'lucide-react';
import { useDoctorState, Appointment } from './DoctorStateContext';
import CalendarEventBadge from '@/components/ui/CalendarEventBadge';
import { useSession } from 'next-auth/react';
import AppointmentChat from '@/components/shared/AppointmentChat';

export default function AppointmentsPage() {
  const { appointments, setAppointments, addNotification, patients } = useDoctorState();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'All' | 'Confirmed' | 'Pending' | 'Cancelled'>('All');
  const [isScheduling, setIsScheduling] = useState(false);
  const [chatAppointment, setChatAppointment] = useState<Appointment | null>(null);
  const [newAppt, setNewAppt] = useState({ patientName: '', patientId: '', date: '', time: '', type: 'Consultation', mode: 'Offline' as 'Online' | 'Offline' });

  const currentUserId   = (session?.user as any)?.id ?? '';
  const currentUserName = session?.user?.name ?? 'Doctor';

  const filteredAppointments = appointments.filter(apt =>
    activeTab === 'All' ? true : apt.status === activeTab
  ).sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleUpdateStatus = async (id: string, status: 'Confirmed' | 'Cancelled') => {
    const res = await fetch('/api/doctor/appointments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      alert(errorData.error || 'Failed to update appointment');
      return;
    }

    // Optimistic update
    setAppointments(appointments.map(apt => apt.id === id ? { ...apt, status } : apt));

    // If confirmed, update meetLink and calendarEventLink in state
    const { meetLink, calendarEventLink } = await res.json();
    setAppointments(prev => prev.map(apt =>
      apt.id === id
        ? {
            ...apt,
            status,
            ...(meetLink ? { meetLink } : {}),
            ...((calendarEventLink !== undefined) ? { calendarEventLink } : {}),
          }
        : apt,
    ));

    const target = appointments.find(a => a.id === id);
    if (target) {
      addNotification({
        title: `Appointment ${status}`,
        message: `Appointment for ${target.patientName} has been ${status.toLowerCase()}`,
        type: status === 'Confirmed' ? 'appointment' : 'alert',
      });
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.patientName || !newAppt.date || !newAppt.time) return;

    // Try to resolve patientId from known patients
    const matchedPatient = patients.find(p =>
      p.name.toLowerCase() === newAppt.patientName.toLowerCase()
    );

    const res = await fetch('/api/doctor/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newAppt,
        patientId: matchedPatient?.userId ?? null,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      alert(errorData.error || 'Failed to create appointment');
      return;
    }

    const { appointment } = await res.json();
    setAppointments(prev => [...prev, appointment]);
    addNotification({
      title: 'New Appointment Scheduled',
      message: `Scheduled ${newAppt.type} for ${newAppt.patientName}`,
      type: 'appointment'
    });

    setIsScheduling(false);
    setNewAppt({ patientName: '', patientId: '', date: '', time: '', type: 'Consultation', mode: 'Offline' });
  };

  return (
    <>
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointments</h1>
          <p className="text-gray-600 flex items-center gap-2">
            Manage your daily schedule and consultations
            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live sync
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsScheduling(!isScheduling)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          {isScheduling ? 'Cancel' : 'Schedule New'}
        </button>
      </div>

      {isScheduling && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-l-4 border-blue-500">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Schedule New Appointment</h2>
          <form onSubmit={handleScheduleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label htmlFor="appt-patient" className="block text-sm font-semibold text-gray-700 mb-2">Patient Name</label>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {patients.length > 0 ? (
                  <select
                    id="appt-patient"
                    required
                    value={newAppt.patientName}
                    onChange={(e) => {
                      const p = patients.find(p => p.name === e.target.value);
                      setNewAppt({ ...newAppt, patientName: e.target.value, patientId: p?.userId ?? '' });
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select patient...</option>
                    {patients.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                ) : (
                  <input
                    id="appt-patient"
                    type="text"
                    required
                    placeholder="Enter patient name..."
                    value={newAppt.patientName}
                    onChange={(e) => setNewAppt({ ...newAppt, patientName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            </div>
            <div>
              <label htmlFor="appt-date" className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                id="appt-date"
                type="date"
                required
                value={newAppt.date}
                onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="appt-time" className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
              <input
                id="appt-time"
                type="time"
                required
                value={newAppt.time}
                onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="appt-type" className="block text-sm font-semibold text-gray-700 mb-2">Consultation Type</label>
              <select
                id="appt-type"
                value={newAppt.type}
                onChange={(e) => setNewAppt({ ...newAppt, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Emergency">Emergency</option>
                <option value="Routine Checkup">Routine Checkup</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mode</label>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setNewAppt({ ...newAppt, mode: 'Offline' })}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${newAppt.mode === 'Offline' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >Offline (Clinic)</button>
                <button
                  type="button"
                  onClick={() => setNewAppt({ ...newAppt, mode: 'Online' })}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${newAppt.mode === 'Online' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >Online (Telemed)</button>
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end items-end">
              <button type="submit" className="px-8 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors h-[42px]">
                Confirm Booking
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex border-b border-gray-200 mb-6">
        {(['All', 'Confirmed', 'Pending', 'Cancelled'] as const).map(tab => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-6 font-medium text-sm transition-colors border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Pending' && (
        <div className="bg-blue-50 border border-blue-100 text-blue-800 px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
          <span className="text-xl">ℹ️</span>
          <div>
            <h4 className="font-semibold text-sm">Patient Requested Appointments</h4>
            <p className="text-sm opacity-90">Appointments requested by patients via their portal appear here as Pending. You must confirm or cancel them.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No appointments found in this category.</p>
            </div>
          ) : filteredAppointments.map((apt) => (
            <div key={apt.id} className="flex flex-col sm:flex-row items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors duration-150 gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${apt.avatar}`}
                  alt={apt.patientName}
                  className="w-12 h-12 rounded-full hidden sm:block"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{apt.patientName}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> {apt.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {apt.time}</span>
                  </p>
                  {(apt as Appointment & { reason?: string; initiatedBy?: string }).reason && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      &quot;{(apt as Appointment & { reason?: string }).reason}&quot;
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(apt.status)}`}>{apt.status}</span>
                  <span className="text-xs text-gray-500 font-medium">{apt.type} • {apt.mode}</span>
                  {(apt as Appointment & { initiatedBy?: string }).initiatedBy === 'patient' && (
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Patient Request</span>
                  )}

                  {/* Google Meet join */}
                  {apt.status === 'Confirmed' && apt.mode === 'Online' && apt.meetLink && (
                    <a
                      href={apt.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full hover:bg-indigo-100 transition-colors border border-indigo-200"
                      onClick={e => e.stopPropagation()}
                    >
                      <Video className="w-3.5 h-3.5" /> Join Meet
                    </a>
                  )}

                  {/* Chat button — only for confirmed appointments */}
                  {apt.status === 'Confirmed' && (
                    <button
                      type="button"
                      onClick={() => setChatAppointment(apt)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full hover:bg-teal-100 transition-colors border border-teal-200"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Chat
                    </button>
                  )}

                  {/* Calendar badge */}
                  {apt.status !== 'Cancelled' && (
                    <CalendarEventBadge
                      eventLink={(apt as any).calendarEventLink ?? null}
                      onAdd={async () => {
                        const res = await fetch('/api/calendar', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            summary: `${apt.type} — ${apt.patientName}`,
                            description: `Appointment with patient ${apt.patientName}.\nMode: ${apt.mode}${apt.meetLink ? `\n\nJoin Google Meet: ${apt.meetLink}` : ''}`,
                            date: apt.date,
                            time: apt.time,
                            durationMins: 30,
                          }),
                        });
                        if (!res.ok) return null;
                        const data = await res.json();
                        const link = data.eventLink ?? null;
                        if (link) {
                          setAppointments(prev => prev.map(a =>
                            a.id === apt.id ? { ...a, calendarEventLink: link } as any : a,
                          ));
                        }
                        return link;
                      }}
                      size="sm"
                    />
                  )}
                </div>

                {apt.status === 'Pending' && (
                  <div className="flex gap-2 ml-4">
                    <button
                      type="button"
                      title="Confirm Appointment"
                      onClick={() => handleUpdateStatus(apt.id, 'Confirmed')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      title="Cancel Appointment"
                      onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}
                {apt.status === 'Confirmed' && (
                  <div className="ml-4">
                    <button
                      type="button"
                      title="Cancel Appointment"
                      onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Real-time Chat Modal */}
    {chatAppointment && currentUserId && (
      <AppointmentChat
        appointmentId={chatAppointment.id}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        senderRole="doctor"
        otherPersonName={chatAppointment.patientName}
        onClose={() => setChatAppointment(null)}
      />
    )}
    </>
  );
}
