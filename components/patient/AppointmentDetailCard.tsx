'use client';

import { useState } from 'react';
import { Video, MessageSquare, Calendar, Clock, MapPin, Stethoscope, Phone, Mail } from 'lucide-react';
import { useSession } from 'next-auth/react';
import AppointmentChat from '@/components/shared/AppointmentChat';

interface AppointmentDetailCardProps {
  appointment: {
    id: string;
    doctorName: string;
    date: string;
    time: string;
    type: string;
    mode: 'Online' | 'Offline';
    status: string;
    reason?: string;
    meetLink?: string | null;
  };
  doctorInfo?: {
    specialty?: string;
    experience?: string;
    qualifications?: string;
    hospital?: string;
    phone?: string;
    email?: string;
    avatarUrl?: string | null;
  };
}

export default function AppointmentDetailCard({ appointment, doctorInfo }: AppointmentDetailCardProps) {
  const { data: session } = useSession();
  const [showChat, setShowChat] = useState(false);

  const currentUserId   = (session?.user as any)?.id ?? '';
  const currentUserName = session?.user?.name ?? 'Patient';

  const handleVideoCall = () => {
    if (appointment.meetLink) {
      window.open(appointment.meetLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border-2 border-blue-200 shadow-xl p-6 mb-6">

        {/* Doctor Header */}
        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-blue-100">
          {doctorInfo?.avatarUrl ? (
            <img
              src={doctorInfo.avatarUrl}
              alt={appointment.doctorName}
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-blue-100">
              {appointment.doctorName.charAt(0)}
            </div>
          )}

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Dr. {appointment.doctorName}</h2>
            {doctorInfo?.specialty && (
              <p className="text-blue-600 font-semibold flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4" />
                {doctorInfo.specialty}
              </p>
            )}
            {doctorInfo?.experience && (
              <p className="text-sm text-gray-600">{doctorInfo.experience} experience</p>
            )}
            {doctorInfo?.qualifications && (
              <p className="text-sm text-gray-500 mt-1">{doctorInfo.qualifications}</p>
            )}
          </div>
        </div>

        {/* Appointment Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500 font-semibold">Date</p>
              <p className="text-sm font-bold text-gray-900">
                {new Date(appointment.date).toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200">
            <Clock className="w-5 h-5 text-teal-500" />
            <div>
              <p className="text-xs text-gray-500 font-semibold">Time</p>
              <p className="text-sm font-bold text-gray-900">{appointment.time}</p>
            </div>
          </div>
        </div>

        {doctorInfo?.hospital && (
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 mb-6">
            <MapPin className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-xs text-gray-500 font-semibold">Location</p>
              <p className="text-sm font-bold text-gray-900">{doctorInfo.hospital}</p>
            </div>
          </div>
        )}

        {/* Contact Info */}
        {(doctorInfo?.phone || doctorInfo?.email) && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Contact Information</p>
            {doctorInfo.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{doctorInfo.phone}</span>
              </div>
            )}
            {doctorInfo.email && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{doctorInfo.email}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {appointment.mode === 'Online' && appointment.meetLink && (
            <button
              type="button"
              onClick={handleVideoCall}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md"
            >
              <Video className="w-5 h-5" />
              Join Video Consultation
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowChat(true)}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-teal-600 to-emerald-700 text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md"
          >
            <MessageSquare className="w-5 h-5" />
            Chat with Doctor
          </button>
        </div>

        {appointment.reason && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-600 uppercase mb-2">Your Reason for Visit</p>
            <p className="text-sm text-gray-700 italic">&quot;{appointment.reason}&quot;</p>
          </div>
        )}
      </div>

      {/* Real-time Chat Modal */}
      {showChat && currentUserId && (
        <AppointmentChat
          appointmentId={appointment.id}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          senderRole="patient"
          otherPersonName={`Dr. ${appointment.doctorName}`}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}
