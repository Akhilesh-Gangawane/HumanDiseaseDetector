'use client';

import { useState } from 'react';
import {
  User,
  Bell,
  Lock,
  Globe,
  Moon,
  Sun,
  Mail,
  Phone,
  MapPin,
  Save,
  Camera,
  Shield,
  Heart,
  Clock,
  Languages,
  Calendar,
  Activity,
} from 'lucide-react';
import PatientNavbar from '@/components/patient/PatientNavbar';
import Footer from '@/components/patient/Footer';
import NeuralNetworkContainer from '@/components/ui/NeuralNetworkContainer';

export default function PatientSettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const sections = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'health', label: 'Health Information', icon: Heart },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Privacy', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            JD
          </div>
          <button 
            type="button"
            className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
            aria-label="Change profile picture"
          >
            <Camera className="w-4 h-4 text-blue-600" />
          </button>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">John Doe</h3>
          <p className="text-gray-600">Patient ID: PAT-2026-001</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            id="full-name"
            type="text"
            defaultValue="John Doe"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          <input
            id="dob"
            type="date"
            defaultValue="1990-01-15"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email
          </label>
          <input
            id="email"
            type="email"
            defaultValue="john.doe@email.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            defaultValue="+1 (555) 987-6543"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select 
            id="gender"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
            <option>Prefer not to say</option>
          </select>
        </div>

        <div>
          <label htmlFor="blood-group" className="block text-sm font-medium text-gray-700 mb-2">
            Blood Group
          </label>
          <select 
            id="blood-group"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
            <option>O+</option>
            <option>O-</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Address
          </label>
          <textarea
            id="address"
            defaultValue="123 Main Street, Apartment 4B, City, State 12345"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderHealthSettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Keep your health information up to date for accurate AI predictions and better healthcare recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
            Height (cm)
          </label>
          <input
            id="height"
            type="number"
            defaultValue="175"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
            Weight (kg)
          </label>
          <input
            id="weight"
            type="number"
            defaultValue="70"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-2">
            Allergies
          </label>
          <textarea
            id="allergies"
            placeholder="List any allergies (e.g., Penicillin, Peanuts, Latex)"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="medications" className="block text-sm font-medium text-gray-700 mb-2">
            Current Medications
          </label>
          <textarea
            id="medications"
            placeholder="List any medications you're currently taking"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="medical-history" className="block text-sm font-medium text-gray-700 mb-2">
            Medical History
          </label>
          <textarea
            id="medical-history"
            placeholder="Describe any significant medical conditions or past surgeries"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Name
            </label>
            <input
              type="text"
              placeholder="Emergency contact name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              placeholder="Emergency contact phone"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship
            </label>
            <input
              type="text"
              placeholder="Relationship to patient"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Choose how you want to receive updates about appointments, test results, and health reminders.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive updates via email</p>
            </div>
          </div>
          {/* @ts-ignore - aria-checked with boolean is valid */}
          {/* eslint-disable-next-line jsx-a11y/aria-proptypes */}
          <button
            type="button"
            onClick={() => setEmailNotifications(!emailNotifications)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            aria-label="Toggle email notifications"
            data-state={emailNotifications ? 'checked' : 'unchecked'}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                emailNotifications ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">Push Notifications</h4>
              <p className="text-sm text-gray-600">Get instant alerts on your device</p>
            </div>
          </div>
          {/* @ts-ignore - aria-checked with boolean is valid */}
          {/* eslint-disable-next-line jsx-a11y/aria-proptypes */}
          <button
            type="button"
            onClick={() => setPushNotifications(!pushNotifications)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              pushNotifications ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            aria-label="Toggle push notifications"
            data-state={pushNotifications ? 'checked' : 'unchecked'}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                pushNotifications ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">SMS Notifications</h4>
              <p className="text-sm text-gray-600">Receive text messages for important updates</p>
            </div>
          </div>
          {/* @ts-ignore - aria-checked with boolean is valid */}
          {/* eslint-disable-next-line jsx-a11y/aria-proptypes */}
          <button
            type="button"
            onClick={() => setSmsNotifications(!smsNotifications)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              smsNotifications ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            aria-label="Toggle SMS notifications"
            data-state={smsNotifications ? 'checked' : 'unchecked'}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                smsNotifications ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          {[
            'Appointment reminders',
            'Test results available',
            'Prescription refill reminders',
            'Health tips and recommendations',
            'New features and updates',
          ].map((item) => (
            <label key={item} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            Protect your health data with a strong password and two-factor authentication.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <input
            type="password"
            placeholder="Enter current password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Enable 2FA</h4>
            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
          </div>
          <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Enable
          </button>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Privacy Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700">Share my health data with my doctors</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700">Allow anonymous data for research purposes</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700">Show my profile to healthcare providers</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPreferencesSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="w-5 h-5 text-blue-600" />
            ) : (
              <Sun className="w-5 h-5 text-blue-600" />
            )}
            <div>
              <h4 className="font-medium text-gray-900">Dark Mode</h4>
              <p className="text-sm text-gray-600">Switch to dark theme</p>
            </div>
          </div>
          {/* @ts-ignore - aria-checked with boolean is valid */}
          {/* eslint-disable-next-line jsx-a11y/aria-proptypes */}
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              darkMode ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            aria-label="Toggle dark mode"
            data-state={darkMode ? 'checked' : 'unchecked'}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                darkMode ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Languages className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Language</h4>
          </div>
          <label htmlFor="language" className="sr-only">Select language</label>
          <select 
            id="language"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>English (US)</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
            <option>Hindi</option>
          </select>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Time Zone</h4>
          </div>
          <label htmlFor="timezone" className="sr-only">Select time zone</label>
          <select 
            id="timezone"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>UTC-5 (Eastern Time)</option>
            <option>UTC-6 (Central Time)</option>
            <option>UTC-7 (Mountain Time)</option>
            <option>UTC-8 (Pacific Time)</option>
          </select>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Date Format</h4>
          </div>
          <label htmlFor="date-format" className="sr-only">Select date format</label>
          <select 
            id="date-format"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>MM/DD/YYYY</option>
            <option>DD/MM/YYYY</option>
            <option>YYYY-MM-DD</option>
          </select>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Units of Measurement</h4>
          </div>
          <label htmlFor="units" className="sr-only">Select units of measurement</label>
          <select 
            id="units"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>Metric (kg, cm)</option>
            <option>Imperial (lbs, inches)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings();
      case 'health':
        return renderHealthSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'preferences':
        return renderPreferencesSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <NeuralNetworkContainer className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white">
      <PatientNavbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-white/20 p-4 sticky top-24">
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      type="button"
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-blue-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="backdrop-blur-md bg-white/80 rounded-xl shadow-lg border border-white/20 p-6">
              {renderContent()}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t flex justify-end gap-3">
                <button type="button" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </NeuralNetworkContainer>
  );
}
