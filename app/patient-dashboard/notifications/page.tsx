'use client';

import { Bell, Clock, AlertCircle, Trash2, CheckCircle2, ArrowLeft, Pill, Calendar, FileText, Loader2 } from 'lucide-react';
import PatientNavbar from '@/components/patient/PatientNavbar';
import Footer from '@/components/patient/Footer';
import NeuralNetworkContainer from '@/components/ui/NeuralNetworkContainer';
import { useRouter } from 'next/navigation';
import { usePatientState } from '@/components/patient/PatientStateContext';

export default function PatientNotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loadingNotifs: loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = usePatientState();

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'appointment':  return <Calendar    className="w-6 h-6 text-blue-500" />;
      case 'result':       return <FileText    className="w-6 h-6 text-green-500" />;
      case 'prescription': return <Pill        className="w-6 h-6 text-purple-500" />;
      default:             return <Bell        className="w-6 h-6 text-teal-500" />;
    }
  };

  return (
    <NeuralNetworkContainer className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white">
      <PatientNavbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <button
          type="button"
          onClick={() => router.push('/patient-dashboard')}
          className="mb-6 flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 group"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
          <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">Back to Dashboard</span>
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-1">
              Notifications
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              {unreadCount > 0
                ? <><span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full">{unreadCount}</span> unread notification{unreadCount > 1 ? 's' : ''}</>
                : 'All caught up'}
              {/* Live indicator */}
              <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Live
              </span>
            </p>
          </div>
          {notifications.length > 0 && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark all read
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" /> Clear All
              </button>
            </div>
          )}
        </div>

        <div className="backdrop-blur-md bg-white/80 rounded-2xl shadow-lg border border-white/20 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <Bell className="w-14 h-14 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">No notifications</p>
                  <p className="text-sm mt-1">Your doctor&apos;s updates will appear here in real time.</p>
                </div>
              ) : notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`flex items-start gap-4 p-4 border rounded-xl transition-colors duration-200 cursor-pointer ${
                    notif.read
                      ? 'border-gray-100 bg-gray-50 opacity-70'
                      : 'border-blue-100 bg-blue-50/30 hover:bg-blue-50'
                  }`}
                >
                  <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                      {notif.title}
                    </h3>
                    <p className="text-gray-600 mt-1 text-sm">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      {notif.time}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {!notif.read && (
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </NeuralNetworkContainer>
  );
}
