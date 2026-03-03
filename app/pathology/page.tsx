'use client';

import { useState } from 'react';
import PathologyScroll from '@/components/patient/PathologyScroll';
import PatientNavbar from '@/components/patient/PatientNavbar';
import { FlaskConical, Calendar, FileText, Clock } from 'lucide-react';

export default function PathologyPage() {
  const [showDashboard, setShowDashboard] = useState(false);

  if (!showDashboard) {
    return <PathologyScroll onScrollComplete={() => setShowDashboard(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <PatientNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Pathology Lab Dashboard</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Book Test Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Book Lab Test</h3>
            <p className="text-gray-600 mb-4">Schedule your pathology tests online</p>
            <button type="button" className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Book Now
            </button>
          </div>

          {/* View Reports Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">View Reports</h3>
            <p className="text-gray-600 mb-4">Access your lab test results</p>
            <button type="button" className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
              View Reports
            </button>
          </div>

          {/* Track Status Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Track Status</h3>
            <p className="text-gray-600 mb-4">Monitor your test progress</p>
            <button type="button" className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Track Now
            </button>
          </div>
        </div>

        {/* Available Tests Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Tests</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Complete Blood Count (CBC)',
              'Lipid Profile',
              'Liver Function Test',
              'Kidney Function Test',
              'Thyroid Profile',
              'Diabetes Screening',
              'Vitamin D Test',
              'COVID-19 RT-PCR'
            ].map((test, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 shadow hover:shadow-md transition-shadow flex items-center space-x-3">
                <FlaskConical className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">{test}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
