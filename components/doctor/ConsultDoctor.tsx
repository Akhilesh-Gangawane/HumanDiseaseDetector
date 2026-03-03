'use client';

import { useState } from 'react';
import { Send, User } from 'lucide-react';

const doctors = [
  { id: 1, name: 'Dr. Michael Chen', specialty: 'Cardiologist' },
  { id: 2, name: 'Dr. Emily Roberts', specialty: 'Endocrinologist' },
  { id: 3, name: 'Dr. James Wilson', specialty: 'Neurologist' },
];

const messages = [
  {
    id: 1,
    sender: 'Dr. Michael Chen',
    message: 'I reviewed the case. The patient needs immediate ECG monitoring.',
    time: '10:30 AM',
    isOwn: false,
  },
  {
    id: 2,
    sender: 'You',
    message: 'Thank you. Should we start beta-blockers immediately?',
    time: '10:32 AM',
    isOwn: true,
  },
];

export default function ConsultDoctor() {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [caseDescription, setCaseDescription] = useState('');

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Consult Doctor</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultation Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">New Consultation</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Doctor
              </label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select specialist doctor"
                title="Select specialist doctor"
              >
                <option value="">Choose a specialist...</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Case Description
              </label>
              <textarea
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
                rows={8}
                placeholder="Describe the patient case, symptoms, and your concerns..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200">
              <Send className="w-5 h-5" />
              Send Consultation
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Conversations</h2>

          <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] ${
                    msg.isOwn
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  } rounded-2xl p-4`}
                >
                  <p className="text-sm font-semibold mb-1">{msg.sender}</p>
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs mt-2 opacity-70">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
