'use client';

import { Calendar, Clock, Video, ArrowLeft, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import PatientNavbar from '@/components/patient/PatientNavbar';
import Footer from '@/components/patient/Footer';
import NeuralNetworkContainer from '@/components/ui/NeuralNetworkContainer';
import CalendarEventBadge from '@/components/ui/CalendarEventBadge';
import AppointmentDetailCard from '@/components/patient/AppointmentDetailCard';
import { useRouter } from 'next/navigation';
import { usePatientState } from '@/components/patient/PatientStateContext';
import { useState, useEffect } from 'react';

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const { appointments, setAppointments, loadingApts: loading } = usePatientState();
  const [doctorsInfo, setDoctorsInfo] = useState<Record<string, any>>({});

  // Fetch doctor details for all appointments
  useEffect(() => {
    async function fetchDoctorDetails() {
      const response = await fetch('/api/public/doctors');
      if (response.ok) {
        const data = await response.json();
        const doctorMap: Record<string, any> = {};
        data.doctors?.forEach((doc: any) => {
          doctorMap[doc.name] = doc;
        });
        setDoctorsInfo(doctorMap);
      }
    }
    if (appointments.length > 0) {
      fetchDoctorDetails();
    }
  }, [appointments.length]);

  const statusIcon = (s: string) => {
    if (s === 'Confirmed') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (s === 'Cancelled') return <XCircle     className="w-4 h-4 text-red-500" />;
    return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  };

  const statusColor = (s: string) => {
    if (s === 'Confirmed') return 'bg-green-100 text-green-700';
    if (s === 'Cancelled') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  /** Add a calendar event for a specific appointment */
  const makeCalendarAdder = (apt: typeof appointments[0]) => async (): Promise<string | null> => {
    const res = await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: `${apt.type} — Dr. ${apt.doctorName}`,
        description: `Medical appointment with Dr. ${apt.doctorName}.\nMode: ${apt.mode}${apt.reason ? `\nReason: ${apt.reason}` : ''}${apt.meetLink ? `\n\nJoin Google Meet: ${apt.meetLink}` : ''}`,
        date: apt.date,
        time: apt.time,
        durationMins: 30,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const link = data.eventLink ?? null;
    if (link) {
      setAppointments(prev =>
        prev.map(a => a.id === apt.id ? { ...a, calendarEventLink: link } : a),
      );
    }
    return link;
  };

  return (
    <NeuralNetworkContainer className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white">
      <PatientNavbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <button
          type="button"
          onClick={() => router.push('/patient-dashboard')}
          className="mb-6 flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
          <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">Back to Dashboard</span>
        </button>

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            My Appointments
          </h1>
          {/* Live sync indicator */}
          <span className="inline-flex items-center gap-1.5 text-xs text-green-600 font-medium px-3 py-1 bg-green-50 rounded-full border border-green-200">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Live sync
          </span>
        </div>
        <p className="text-gray-500 mb-8">
          Status updates appear instantly when your doctor confirms or cancels.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Calendar className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700">No appointments yet</p>
            <p className="text-gray-500 mt-1 mb-6">Book a consultation with a doctor to get started.</p>
            <button
              type="button"
              onClick={() => router.push('/consult-doctor')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Book Now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.map(apt => {
              const doctorInfo = doctorsInfo[apt.doctorName];
              const isConfirmed = apt.status === 'Confirmed';
              
              // Show detailed card for confirmed appointments
              if (isConfirmed) {
                return (
                  <AppointmentDetailCard
                    key={apt.id}
                    appointment={apt}
                    doctorInfo={doctorInfo}
                  />
                );
              }
              
              // Show compact card for pending/cancelled appointments
              return (
                <div key={apt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          Dr. {apt.doctorName}
                        </h3>
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor(apt.status)}`}>
                          {statusIcon(apt.status)} {apt.status}
                        </span>
                        {apt.mode === 'Online' ? (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                            <Video className="w-3.5 h-3.5" /> Video Call
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
                            <Clock className="w-3.5 h-3.5" /> In-Person
                          </span>
                        )}
                      </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Date</p>
                          <p className="font-semibold text-sm">{new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <Clock className="w-5 h-5 text-teal-500" />
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Time</p>
                          <p className="font-semibold text-sm">
                            {(() => {
                              try {
                                const [h, m] = apt.time.split(':');
                                const hour = parseInt(h);
                                const ampm = hour >= 12 ? 'PM' : 'AM';
                                const displayHour = hour % 12 || 12;
                                return `${displayHour}:${m} ${ampm}`;
                              } catch (e) { return apt.time; }
                            })()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <AlertCircle className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Type</p>
                          <p className="font-semibold text-sm">{apt.type}</p>
                        </div>
                      </div>
                    </div>

                    {apt.reason && (
                      <div className="mb-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                        <p className="text-xs font-bold text-blue-400 uppercase mb-1">Reason for visit</p>
                        <p className="text-sm text-gray-700 italic">&quot;{apt.reason}&quot;</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 flex-wrap">
                      {apt.status === 'Confirmed' && apt.mode === 'Online' && apt.meetLink && (
                        <a
                          href={apt.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md"
                        >
                          <Video className="w-5 h-5" />
                          Join Consultation Now
                        </a>
                      )}

                      {apt.status === 'Pending' && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-sm font-bold">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Waiting for doctor to confirm...
                        </div>
                      )}

                      {apt.status === 'Confirmed' && apt.mode === 'Online' && !apt.meetLink && (
                        <span className="text-sm text-gray-400 italic bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                          Meet link will be available shortly...
                        </span>
                      )}

                      {apt.status !== 'Cancelled' && (
                        <div className="flex items-center">
                          <CalendarEventBadge
                            eventLink={apt.calendarEventLink}
                            onAdd={makeCalendarAdder(apt)}
                            size="md"
                          />
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </NeuralNetworkContainer>
  );
}
