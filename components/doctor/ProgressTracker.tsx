'use client';

import { Activity, TrendingUp, Calendar } from 'lucide-react';

const healthMetrics = [
  { label: 'Blood Pressure', value: '120/80', trend: 'stable', color: 'green' },
  { label: 'Blood Sugar', value: '95 mg/dL', trend: 'down', color: 'blue' },
  { label: 'Heart Rate', value: '72 bpm', trend: 'stable', color: 'purple' },
  { label: 'Weight', value: '75 kg', trend: 'down', color: 'orange' },
];

const visitHistory = [
  { date: '2024-02-15', reason: 'Regular Checkup', doctor: 'Dr. Sarah Johnson' },
  { date: '2024-01-20', reason: 'Blood Test', doctor: 'Dr. Sarah Johnson' },
  { date: '2023-12-10', reason: 'Follow-up', doctor: 'Dr. Michael Chen' },
];

const prescriptions = [
  { medicine: 'Metformin 500mg', dosage: 'Twice daily', duration: '3 months', status: 'Active' },
  { medicine: 'Lisinopril 10mg', dosage: 'Once daily', duration: '6 months', status: 'Active' },
  { medicine: 'Aspirin 75mg', dosage: 'Once daily', duration: 'Ongoing', status: 'Active' },
];

export default function ProgressTracker() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Progress Tracker</h1>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {healthMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className={`w-8 h-8 text-${metric.color}-500`} />
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  metric.trend === 'down'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {metric.trend === 'down' ? '↓' : '→'} {metric.trend}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{metric.label}</h3>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visit History */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            Visit History
          </h2>
          <div className="space-y-4">
            {visitHistory.map((visit, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{visit.reason}</p>
                  <p className="text-sm text-gray-600">{visit.doctor}</p>
                  <p className="text-xs text-gray-500 mt-1">{visit.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prescription History */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-500" />
            Prescription History
          </h2>
          <div className="space-y-4">
            {prescriptions.map((prescription, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-r from-green-50 to-transparent rounded-xl"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-gray-900">{prescription.medicine}</p>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    {prescription.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Dosage: {prescription.dosage}</p>
                <p className="text-sm text-gray-600">Duration: {prescription.duration}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
