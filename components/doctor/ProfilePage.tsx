'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, Award, Calendar, Check, Edit2 } from 'lucide-react';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    email: 'sarah.johnson@hospital.com',
    phone: '+1 (555) 123-4567',
    location: 'City General Hospital, New York',
    license: 'MD-12345-NY',
    experience: '15 Years',
    certifications: 'ABIM, FACC',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col items-center">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                alt={profile.name}
                className="w-32 h-32 rounded-full mb-4"
              />
              {isEditing ? (
                <div className="w-full space-y-2 mb-4">
                  <label htmlFor="profile-name" className="sr-only">Full Name</label>
                  <input
                    id="profile-name"
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-center text-xl font-bold text-gray-900 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="profile-specialty" className="sr-only">Specialty</label>
                  <input
                    id="profile-specialty"
                    type="text"
                    name="specialty"
                    value={profile.specialty}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-center text-gray-600 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h2>
                  <p className="text-gray-600 mb-4">{profile.specialty}</p>
                </>
              )}
              <div className="flex gap-2 mb-6">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Online</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">Verified</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 ${isEditing ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'}`}
              >
                {isEditing ? <><Check className="w-5 h-5" /> Save Changes</> : <><Edit2 className="w-5 h-5" /> Edit Profile</>}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
            <div className="space-y-4">
              {[
                { icon: Mail, color: 'blue', label: 'Email', field: 'email', type: 'email' },
                { icon: Phone, color: 'green', label: 'Phone', field: 'phone', type: 'text' },
                { icon: MapPin, color: 'purple', label: 'Location', field: 'location', type: 'text' },
              ].map(({ icon: Icon, color, label, field, type }) => (
                <div key={field} className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{label}</p>
                    {isEditing ? (
                      <>
                        <label htmlFor={`profile-${field}`} className="sr-only">{label}</label>
                        <input
                          id={`profile-${field}`}
                          type={type}
                          name={field}
                          value={profile[field as keyof typeof profile]}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </>
                    ) : (
                      <p className="font-semibold text-gray-900">{profile[field as keyof typeof profile]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Professional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: Award, color: 'blue', label: 'License Number', field: 'license' },
                { icon: Calendar, color: 'green', label: 'Years of Experience', field: 'experience' },
                { icon: User, color: 'purple', label: 'Specialization', field: 'specialty' },
                { icon: Award, color: 'orange', label: 'Certifications', field: 'certifications' },
              ].map(({ icon: Icon, color, label, field }) => (
                <div key={field}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-5 h-5 text-${color}-600`} />
                    <p className="text-sm text-gray-600">{label}</p>
                  </div>
                  {isEditing ? (
                    <>
                      <label htmlFor={`prof-${field}`} className="sr-only">{label}</label>
                      <input
                        id={`prof-${field}`}
                        type="text"
                        name={field}
                        value={profile[field as keyof typeof profile]}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </>
                  ) : (
                    <p className="font-semibold text-gray-900">{profile[field as keyof typeof profile]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
              <p className="text-blue-100 mb-2">Total Patients</p>
              <p className="text-4xl font-bold">1,284</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
              <p className="text-green-100 mb-2">Success Rate</p>
              <p className="text-4xl font-bold">96.8%</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <p className="text-purple-100 mb-2">Consultations</p>
              <p className="text-4xl font-bold">3,456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
