'use client';

import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';

const appointments = [
  {
    id: 1,
    patientName: 'John Doe',
    time: '09:00 AM',
    date: '2024-02-23',
    type: 'Follow-up',
    status: 'Confirmed',
    avatar: 'John',
  },
  {
    id: 2,
    patientName: 'Emma Wilson',
    time: '10:30 AM',
    date: '2024-02-23',
    type: 'Consultation',
    status: 'Confirmed',
    avatar: 'Emma',
  },
  {
    id: 3,
    patientName: 'Michael Brown',
    time: '02:00 PM',
    date: '2024-02-23',
    type: 'Emergency',
    status: 'Pending',
    avatar: 'Michael',
  },
  {
    id: 4,
    patientName: 'Sarah Davis',
    time: '03:30 PM',
    date: '2024-02-23',
    type: 'Checkup',
    status: 'Confirmed',
    avatar: 'Sarah',
  },
];

export default function AppointmentsPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Emergency':
        return 'bg-red-500';
      case 'Follow-up':
        return 'bg-blue-500';
      case 'Consultation':
        return 'bg-purple-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointments</h1>
          <p className="text-gray-600">Manage your daily appointments</p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200">
          Schedule New Appointment
        </button>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <Calendar className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
          <span className="ml-auto text-sm text-gray-600">February 23, 2024</span>
        </div>

        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center gap-6 p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl hover:shadow-md transition-all duration-200"
            >
              <div className={`w-1 h-20 ${getTypeColor(appointment.type)} rounded-full`} />

              <div className="flex items-center gap-4 flex-1">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${appointment.avatar}`}
                  alt={appointment.patientName}
                  className="w-16 h-16 rounded-full"
                />

                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {appointment.patientName}
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{appointment.time}</span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(
                        appointment.type
                      )} text-white`}
                    >
                      {appointment.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {appointment.status}
                  </span>
                  <button 
                    className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                    aria-label="Confirm appointment"
                    title="Confirm appointment"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </button>
                  <button 
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Cancel appointment"
                    title="Cancel appointment"
                  >
                    <XCircle className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Today</p>
              <p className="text-3xl font-bold text-gray-900">23</p>
            </div>
            <Calendar className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Confirmed</p>
              <p className="text-3xl font-bold text-green-600">18</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">5</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Emergency</p>
              <p className="text-3xl font-bold text-red-600">2</p>
            </div>
            <User className="w-12 h-12 text-red-500 opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
