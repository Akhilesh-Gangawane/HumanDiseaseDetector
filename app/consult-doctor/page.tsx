'use client';

import { useState } from 'react';
import OpdScroll from '@/components/patient/OpdScroll';
import PatientNavbar from '@/components/patient/PatientNavbar';
import { Video, MessageSquare, Calendar, User, Stethoscope } from 'lucide-react';

export default function ConsultDoctorPage() {
  const [showDashboard, setShowDashboard] = useState(false);

  if (!showDashboard) {
    return <OpdScroll onScrollComplete={() => setShowDashboard(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <PatientNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Consult Doctor</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Video Consultation Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Video Consultation</h3>
            <p className="text-gray-600 mb-4">Connect with doctors via video call</p>
            <button type="button" className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Start Video Call
            </button>
          </div>

          {/* Chat Consultation Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Chat with Doctor</h3>
            <p className="text-gray-600 mb-4">Get instant medical advice via chat</p>
            <button type="button" className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
              Start Chat
            </button>
          </div>

          {/* Book Appointment Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Book Appointment</h3>
            <p className="text-gray-600 mb-4">Schedule an in-person visit</p>
            <button type="button" className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Book Now
            </button>
          </div>
        </div>

        {/* Available Doctors Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Specialists</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Dr. Sarah Johnson', specialty: 'Cardiologist', available: true },
              { name: 'Dr. Michael Chen', specialty: 'Neurologist', available: true },
              { name: 'Dr. Emily Davis', specialty: 'Pediatrician', available: false },
              { name: 'Dr. James Wilson', specialty: 'Orthopedic', available: true },
              { name: 'Dr. Lisa Anderson', specialty: 'Dermatologist', available: true },
              { name: 'Dr. Robert Brown', specialty: 'General Physician', available: true },
            ].map((doctor, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{doctor.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <Stethoscope className="w-4 h-4 mr-1" />
                      {doctor.specialty}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className={`w-2 h-2 rounded-full ${doctor.available ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></div>
                      <span className="text-sm text-gray-600">
                        {doctor.available ? 'Available Now' : 'Busy'}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  type="button"
                  disabled={!doctor.available}
                  className={`w-full mt-4 px-4 py-2 rounded-lg transition-colors ${
                    doctor.available 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {doctor.available ? 'Consult Now' : 'Not Available'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
