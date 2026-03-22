'use client';

import { useState } from 'react';
import { Users, Brain, AlertTriangle, Calendar } from 'lucide-react';
import StatCard from './StatCard';

export default function DashboardOverview() {
  const [isOnline, setIsOnline] = useState(true);

  const stats = [
    { title: 'Total Patients', value: '1,284', change: '+12.5%', icon: Users, color: 'blue', trend: 'up' as const },
    { title: 'AI Predictions Today', value: '47', change: '+8.2%', icon: Brain, color: 'purple', trend: 'up' as const },
    { title: 'High-Risk Alerts', value: '12', change: '-3.1%', icon: AlertTriangle, color: 'red', trend: 'down' as const },
    { title: 'Appointments Today', value: '23', change: '+5.4%', icon: Calendar, color: 'green', trend: 'up' as const },
  ];

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Dr. Sarah Johnson</h1>
          <p className="text-gray-600">Here&apos;s what&apos;s happening with your patients today</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow-sm border border-gray-100">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
            alt="Dr. Sarah Johnson"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold text-gray-900 text-sm">Dr. Sarah Johnson</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOnline(!isOnline)}
                className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`}
                aria-label={`Toggle status: Currently ${isOnline ? 'online' : 'offline'}`}
                title={`Toggle status: Currently ${isOnline ? 'online' : 'offline'}`}
              />
              <span className="text-xs text-gray-500">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Patients</h2>
          <div className="space-y-4">
            {[
              { name: 'John Doe', age: 45, condition: 'Diabetes Type 2', risk: 'High', time: '10 mins ago' },
              { name: 'Emma Wilson', age: 32, condition: 'Hypertension', risk: 'Medium', time: '25 mins ago' },
              { name: 'Michael Brown', age: 58, condition: 'Heart Disease', risk: 'High', time: '1 hour ago' },
            ].map((patient, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`}
                    alt={patient.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-600">{patient.age} years • {patient.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${patient.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {patient.risk} Risk
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{patient.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: 'New Prescription', icon: '📝', color: 'blue' },
              { label: 'Schedule Appointment', icon: '📅', color: 'green' },
              { label: 'Review AI Predictions', icon: '🤖', color: 'purple' },
              { label: 'Consult Specialist', icon: '👨‍⚕️', color: 'orange' },
            ].map((action, index) => (
              <button
                type="button"
                key={index}
                className={`w-full flex items-center gap-3 p-4 bg-gradient-to-r from-${action.color}-50 to-transparent rounded-xl hover:shadow-md transition-all duration-200`}
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="font-medium text-gray-900">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          Recent AI Predictions Feed
        </h2>
        <div className="space-y-4">
          {[
            { patient: 'Alice Smith', disease: 'Pneumonia', confidence: 91, time: '2 mins ago', severity: 'High' },
            { patient: 'Robert Johnson', disease: 'Arthritis', confidence: 85, time: '15 mins ago', severity: 'Low' },
            { patient: 'Emily Davis', disease: 'Migraine', confidence: 78, time: '1 hour ago', severity: 'Medium' }
          ].map((prediction, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-12 rounded-full ${prediction.severity === 'High' ? 'bg-red-500' : prediction.severity === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                <div>
                  <p className="font-semibold text-gray-900">{prediction.patient}</p>
                  <p className="text-sm text-gray-600">Predicted: <span className="font-medium text-purple-600">{prediction.disease}</span> ({prediction.confidence}% confidence)</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{prediction.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
