'use client';

import { User, Mail, Phone, MapPin, Award, Calendar } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col items-center">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                alt="Dr. Sarah Johnson"
                className="w-32 h-32 rounded-full mb-4"
              />
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Dr. Sarah Johnson</h2>
              <p className="text-gray-600 mb-4">Cardiologist</p>
              <div className="flex gap-2 mb-6">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  Online
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  Verified
                </span>
              </div>
              <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">sarah.johnson@hospital.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900">
                    City General Hospital, New York
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Professional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-gray-600">License Number</p>
                </div>
                <p className="font-semibold text-gray-900">MD-12345-NY</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-gray-600">Years of Experience</p>
                </div>
                <p className="font-semibold text-gray-900">15 Years</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-purple-600" />
                  <p className="text-sm text-gray-600">Specialization</p>
                </div>
                <p className="font-semibold text-gray-900">Cardiology</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-orange-600" />
                  <p className="text-sm text-gray-600">Certifications</p>
                </div>
                <p className="font-semibold text-gray-900">ABIM, FACC</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
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
