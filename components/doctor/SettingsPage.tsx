'use client';

import { useState } from 'react';
import {
  User, Bell, Lock, Globe, Moon, Sun, Mail, Phone, MapPin,
  Briefcase, Save, Camera, Shield, CreditCard, Clock, Languages,
} from 'lucide-react';
import DashboardHeader from './DashboardHeader';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const sections = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Privacy', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
  ];

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            DR
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
          <h3 className="text-xl font-bold text-gray-900">Dr. Sarah Johnson</h3>
          <p className="text-gray-600">Cardiologist</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="settings-name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input id="settings-name" type="text" defaultValue="Dr. Sarah Johnson" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label htmlFor="settings-email" className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />Email
          </label>
          <input id="settings-email" type="email" defaultValue="sarah.johnson@hospital.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label htmlFor="settings-phone" className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />Phone Number
          </label>
          <input id="settings-phone" type="tel" defaultValue="+1 (555) 123-4567" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label htmlFor="settings-spec" className="block text-sm font-medium text-gray-700 mb-2">
            <Briefcase className="w-4 h-4 inline mr-2" />Specialization
          </label>
          <input id="settings-spec" type="text" defaultValue="Cardiologist" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="settings-address" className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />Address
          </label>
          <textarea id="settings-address" defaultValue="123 Medical Center, Healthcare District, City, State 12345" rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="settings-bio" className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea id="settings-bio" defaultValue="Experienced cardiologist with over 10 years of practice. Specialized in interventional cardiology and heart disease prevention." rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>
    </div>
  );

  const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
      aria-label={label}
      data-state={checked ? 'checked' : 'unchecked'}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`} />
    </button>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">Manage how you receive notifications about appointments, patient updates, and system alerts.</p>
      </div>
      <div className="space-y-4">
        {[
          { icon: Mail, label: 'Email Notifications', desc: 'Receive updates via email', checked: emailNotifications, onChange: () => setEmailNotifications(!emailNotifications) },
          { icon: Bell, label: 'Push Notifications', desc: 'Get instant alerts on your device', checked: pushNotifications, onChange: () => setPushNotifications(!pushNotifications) },
          { icon: Phone, label: 'SMS Notifications', desc: 'Receive text messages for urgent updates', checked: smsNotifications, onChange: () => setSmsNotifications(!smsNotifications) },
        ].map(({ icon: Icon, label, desc, checked, onChange }) => (
          <div key={label} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">{label}</h4>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            </div>
            <ToggleSwitch checked={checked} onChange={onChange} label={`Toggle ${label}`} />
          </div>
        ))}
      </div>
      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          {['New patient appointments', 'Patient test results', 'Prescription refill requests', 'Emergency alerts', 'System updates'].map((item) => (
            <label key={item} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
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
          <p className="text-sm text-yellow-800">Keep your account secure by using a strong password and enabling two-factor authentication.</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <input id="current-password" type="password" placeholder="Enter current password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <input id="new-password" type="password" placeholder="Enter new password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <input id="confirm-password" type="password" placeholder="Confirm new password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>
      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Enable 2FA</h4>
            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
          </div>
          <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Enable</button>
        </div>
      </div>
      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Active Sessions</h3>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Windows PC - Chrome</p>
              <p className="text-sm text-gray-600">Current session • Last active: Now</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">Active</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="w-5 h-5 text-blue-600" /> : <Sun className="w-5 h-5 text-blue-600" />}
            <div>
              <h4 className="font-medium text-gray-900">Dark Mode</h4>
              <p className="text-sm text-gray-600">Switch to dark theme</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
            aria-label="Toggle dark mode"
            data-state={darkMode ? 'checked' : 'unchecked'}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-6' : ''}`} />
          </button>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Languages className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Language</h4>
          </div>
          <label htmlFor="language" className="sr-only">Select language</label>
          <select id="language" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>English (US)</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
          </select>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Time Zone</h4>
          </div>
          <label htmlFor="timezone" className="sr-only">Select time zone</label>
          <select id="timezone" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
          <select id="date-format" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>MM/DD/YYYY</option>
            <option>DD/MM/YYYY</option>
            <option>YYYY-MM-DD</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderBillingSettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">Professional Plan</h3>
        <p className="text-blue-100 mb-4">$99/month • Billed annually</p>
        <button type="button" className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">Upgrade Plan</button>
      </div>
      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Payment Methods</h3>
        <div className="p-4 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
              <p className="text-sm text-gray-600">Expires 12/25</p>
            </div>
          </div>
          <button type="button" className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
        </div>
        <button type="button" className="mt-4 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">Add Payment Method</button>
      </div>
      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Billing History</h3>
        <div className="space-y-2">
          {[
            { date: 'Mar 1, 2026', amount: '$99.00', status: 'Paid' },
            { date: 'Feb 1, 2026', amount: '$99.00', status: 'Paid' },
            { date: 'Jan 1, 2026', amount: '$99.00', status: 'Paid' },
          ].map((invoice, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{invoice.date}</p>
                <p className="text-sm text-gray-600">{invoice.amount}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">{invoice.status}</span>
                <button type="button" className="text-blue-600 hover:text-blue-700 text-sm font-medium">Download</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSettings();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      case 'preferences': return renderPreferencesSettings();
      case 'billing': return renderBillingSettings();
      default: return renderProfileSettings();
    }
  };

  return (
    <div className="p-8">
      <DashboardHeader title="Settings" subtitle="Manage your account settings and preferences" />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    type="button"
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === section.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {renderContent()}
            <div className="mt-8 pt-6 border-t flex justify-end gap-3">
              <button type="button" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
