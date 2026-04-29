'use client';

import { Calendar, Clock, Video, ArrowLeft, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import PatientNavbar from '@/components/patient/PatientNavbar';
import Footer from '@/components/patient/Footer';
import NeuralNetworkContainer from '@/components/ui/NeuralNetworkContainer';
import CalendarEventBadge from '@/components/ui/CalendarEventBadge';
import { useRouter } from 'next/navigation';
import { usePatientState } from '@/components/patient/PatientStateContext';

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const { appointments, setAppointments, loadingApts: loading } = usePatientState();

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
          <div className="space-y-4">
            {appointments.map(apt => (
              <div key={apt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">{apt.doctorName}</h3>
                      <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor(apt.status)}`}>
                        {statusIcon(apt.status)} {apt.status}
                      </span>
                      {apt.mode === 'Online' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                          Online
                        </span>
                      )}
                      {apt.initiatedBy === 'doctor' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                          Doctor-Scheduled
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> {apt.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> {apt.time}
                      </span>
                      <span className="text-gray-400">{apt.type}</span>
                    </div>

                    {apt.reason && (
                      <p className="text-sm text-gray-500 mt-2 italic">&quot;{apt.reason}&quot;</p>
                    )}

                    {/* Action row */}
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {/* Google Meet join button - ONLY show when confirmed */}
                      {apt.status === 'Confirmed' && apt.mode === 'Online' && apt.meetLink && (
                        <a
                          href={apt.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                        >
                          <Video className="w-4 h-4" />
                          Join Google Meet
                        </a>
                      )}

                      {/* Pending status message */}
                      {apt.status === 'Pending' && apt.mode === 'Online' && (
                        <span className="text-xs text-amber-600 font-medium bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                          ⏳ Waiting for doctor confirmation
                        </span>
                      )}

                      {apt.status === 'Confirmed' && apt.mode === 'Online' && !apt.meetLink && (
                        <span className="text-xs text-gray-400 italic">Meet link will be available shortly…</span>
                      )}

                      {/* Calendar badge */}
                      {apt.status !== 'Cancelled' && (
                        <CalendarEventBadge
                          eventLink={apt.calendarEventLink}
                          onAdd={makeCalendarAdder(apt)}
                          size="sm"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </NeuralNetworkContainer>
  );
}
