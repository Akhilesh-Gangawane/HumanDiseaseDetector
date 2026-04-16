'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Award, Calendar, Check, Edit2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface DoctorProfile {
  name: string;
  specialty: string;
  email: string;
  phone: string;
  location: string;
  license: string;
  experience: string;
  certifications: string;
  avatarUrl: string;
}

const defaultProfile: DoctorProfile = {
  name: '',
  specialty: '',
  email: '',
  phone: '',
  location: '',
  license: '',
  experience: '',
  certifications: '',
  avatarUrl: '',
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<DoctorProfile>(defaultProfile);
  const [editedProfile, setEditedProfile] = useState<DoctorProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!session?.user?.email) return;
    const fetchProfile = async () => {
      setLoading(true);
      const res = await fetch('/api/user/profile');
      if (!res.ok) { setLoading(false); return; }
      const { user: userRow, doctor: doctorRow } = await res.json();

      const merged: DoctorProfile = {
        name: userRow.full_name ?? session.user?.name ?? '',
        specialty: doctorRow?.specialization ?? '',
        email: userRow.email ?? '',
        phone: '',
        location: '',
        license: doctorRow?.license_number ?? '',
        experience: doctorRow?.experience_years ? `${doctorRow.experience_years}` : '',
        certifications: doctorRow?.qualifications?.join(', ') ?? '',
        avatarUrl: userRow.avatar_url ?? session.user?.image ?? '',
      };
      setProfile(merged);
      setEditedProfile(merged);
      setLoading(false);
    };
    fetchProfile();
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedProfile({ ...editedProfile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setProfile(editedProfile);
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);

    await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: editedProfile.name,
        doctor: {
          specialization: editedProfile.specialty,
          license_number: editedProfile.license,
          experience_years: editedProfile.experience ? parseInt(editedProfile.experience) || null : null,
          certifications: editedProfile.certifications,
        },
      }),
    });
  };

  const avatarSrc = profile.avatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name || 'Doctor')}`;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  const data = isEditing ? editedProfile : profile;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

      {saved && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <Check className="w-5 h-5" /> Profile saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col items-center">
              <img
                src={avatarSrc}
                alt={data.name}
                className="w-32 h-32 rounded-full mb-4 object-cover"
              />
              {isEditing ? (
                <div className="w-full space-y-2 mb-4">
                  <label htmlFor="profile-name" className="sr-only">Full Name</label>
                  <input
                    id="profile-name"
                    type="text"
                    name="name"
                    value={editedProfile.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-center text-xl font-bold text-gray-900 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="profile-specialty" className="sr-only">Specialty</label>
                  <input
                    id="profile-specialty"
                    type="text"
                    name="specialty"
                    value={editedProfile.specialty}
                    onChange={handleChange}
                    placeholder="Specialization"
                    className="w-full px-3 py-2 text-center text-gray-600 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{data.name || 'Doctor'}</h2>
                  <p className="text-gray-600 mb-4">{data.specialty || 'Specialist'}</p>
                </>
              )}
              <div className="flex gap-2 mb-6">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Online</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">Verified</span>
              </div>
              <button
                type="button"
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
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
                          value={editedProfile[field as keyof DoctorProfile]}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </>
                    ) : (
                      <p className="font-semibold text-gray-900">{data[field as keyof DoctorProfile] || '—'}</p>
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
                        value={editedProfile[field as keyof DoctorProfile]}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </>
                  ) : (
                    <p className="font-semibold text-gray-900">{data[field as keyof DoctorProfile] || '—'}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
