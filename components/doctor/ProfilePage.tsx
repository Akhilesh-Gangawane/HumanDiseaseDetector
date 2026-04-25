'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Award, Calendar, Check, Edit2, Camera, Loader2, ShieldCheck, ShieldAlert, Clock, Shield } from 'lucide-react';
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
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  medicalCouncil: string;
  registrationYear: string;
  rejectionReason: string;
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
  verificationStatus: 'unverified',
  medicalCouncil: '',
  registrationYear: '',
  rejectionReason: '',
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<DoctorProfile>(defaultProfile);
  const [editedProfile, setEditedProfile] = useState<DoctorProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    setAvatarUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/user/avatar', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) {
        setAvatarError(json.error ?? 'Upload failed');
      } else {
        setAvatarUrl(json.avatarUrl);
        setProfile(prev => ({ ...prev, avatarUrl: json.avatarUrl }));
        setEditedProfile(prev => ({ ...prev, avatarUrl: json.avatarUrl }));
      }
    } catch {
      setAvatarError('Upload failed. Please try again.');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
        verificationStatus: doctorRow?.verification_status ?? 'unverified',
        medicalCouncil: doctorRow?.medical_council ?? '',
        registrationYear: doctorRow?.registration_year ? `${doctorRow.registration_year}` : '',
        rejectionReason: doctorRow?.rejection_reason ?? '',
      };
      setProfile(merged);
      setEditedProfile(merged);
      setAvatarUrl(merged.avatarUrl);
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
          specialization:      editedProfile.specialty,
          license_number:      editedProfile.license,
          experience_years:    editedProfile.experience ? parseInt(editedProfile.experience) || null : null,
          certifications:      editedProfile.certifications,
          medical_council:     editedProfile.medicalCouncil || null,
          registration_year:   editedProfile.registrationYear ? parseInt(editedProfile.registrationYear) || null : null,
          // If they just added a registration number and were unverified, bump to pending
          ...(editedProfile.license && editedProfile.medicalCouncil && profile.verificationStatus === 'unverified'
            ? { verification_status: 'pending' }
            : {}),
        },
      }),
    });
  };

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
              <div className="relative mb-4">
                <img
                  src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name || 'Doctor')}`}
                  alt={data.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarChange}
                  aria-label="Upload profile photo"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform border-2 border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label="Change profile picture"
                >
                  {avatarUploading
                    ? <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    : <Camera className="w-4 h-4 text-blue-600" />
                  }
                </button>
              </div>

              {avatarError && (
                <p className="text-xs text-red-500 mb-2 text-center max-w-[140px]">{avatarError}</p>
              )}
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
              <div className="flex gap-2 mb-6 flex-wrap justify-center">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Online</span>
                {/* Dynamic verification badge */}
                {data.verificationStatus === 'verified' && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                {data.verificationStatus === 'pending' && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                    <Clock className="w-3.5 h-3.5" /> Verification Pending
                  </span>
                )}
                {data.verificationStatus === 'unverified' && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5" /> Not Verified
                  </span>
                )}
                {data.verificationStatus === 'rejected' && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                    <Shield className="w-3.5 h-3.5" /> Verification Failed
                  </span>
                )}
              </div>

              {/* Rejection reason notice */}
              {data.verificationStatus === 'rejected' && data.rejectionReason && (
                <div className="w-full mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
                  <strong>Reason:</strong> {data.rejectionReason}
                </div>
              )}

              {/* Prompt to submit registration if unverified */}
              {data.verificationStatus === 'unverified' && (
                <div className="w-full mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                  Add your Medical Registration Number in Professional Details below to submit for verification.
                </div>
              )}
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
                { icon: Award,       color: 'blue',   label: 'License / Registration Number', field: 'license' },
                { icon: Calendar,    color: 'green',  label: 'Years of Experience',            field: 'experience' },
                { icon: User,        color: 'purple', label: 'Specialization',                 field: 'specialty' },
                { icon: Award,       color: 'orange', label: 'Certifications',                 field: 'certifications' },
                { icon: ShieldCheck, color: 'teal',   label: 'State Medical Council',          field: 'medicalCouncil' },
                { icon: Calendar,    color: 'teal',   label: 'Year of Registration',           field: 'registrationYear' },
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
                        value={(editedProfile[field as keyof DoctorProfile] as string) ?? ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </>
                  ) : (
                    <p className="font-semibold text-gray-900">{(data[field as keyof DoctorProfile] as string) || '—'}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Verification status summary */}
            <div className={`mt-6 rounded-xl p-4 flex items-start gap-3 ${
              data.verificationStatus === 'verified'    ? 'bg-blue-50 border border-blue-200' :
              data.verificationStatus === 'pending'     ? 'bg-amber-50 border border-amber-200' :
              data.verificationStatus === 'rejected'    ? 'bg-red-50 border border-red-200' :
              'bg-gray-50 border border-gray-200'
            }`}>
              {data.verificationStatus === 'verified'   && <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />}
              {data.verificationStatus === 'pending'    && <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />}
              {data.verificationStatus === 'rejected'   && <Shield className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />}
              {data.verificationStatus === 'unverified' && <ShieldAlert className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />}
              <p className={`text-sm font-medium ${
                data.verificationStatus === 'verified'   ? 'text-blue-700' :
                data.verificationStatus === 'pending'    ? 'text-amber-700' :
                data.verificationStatus === 'rejected'   ? 'text-red-700' :
                'text-gray-600'
              }`}>
                {data.verificationStatus === 'verified'   && 'Your medical registration has been verified.'}
                {data.verificationStatus === 'pending'    && 'Verification in progress — our team is reviewing your registration details.'}
                {data.verificationStatus === 'rejected'   && `Verification unsuccessful. ${data.rejectionReason ? `Reason: ${data.rejectionReason}` : 'Please update your details and contact support.'}`}
                {data.verificationStatus === 'unverified' && 'Not yet submitted. Add your registration number and save to submit for verification.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
