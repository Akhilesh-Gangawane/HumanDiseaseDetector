'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Award, Calendar, Check, Edit2, Camera, Loader2, ShieldCheck, ShieldAlert, Clock, Shield, DollarSign, Video, Plus, Trash2, ExternalLink, Navigation, Copy } from 'lucide-react';
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
  googleMeetLink: string;
  consultationFee: string;
  followUpFee: string;
}

interface TreatmentPrice {
  id?: string;
  treatment_name: string;
  treatment_category: string;
  price: string;
  duration_minutes: string;
  description: string;
  is_active: boolean;
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
  googleMeetLink: '',
  consultationFee: '',
  followUpFee: '',
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<DoctorProfile>(defaultProfile);
  const [editedProfile, setEditedProfile] = useState<DoctorProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Treatment prices state
  const [treatmentPrices, setTreatmentPrices] = useState<TreatmentPrice[]>([]);
  const [editingTreatments, setEditingTreatments] = useState(false);
  const [newTreatment, setNewTreatment] = useState<TreatmentPrice>({
    treatment_name: '',
    treatment_category: '',
    price: '',
    duration_minutes: '',
    description: '',
    is_active: true,
  });

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Location state
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Copy link state
  const [linkCopied, setLinkCopied] = useState(false);

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
        googleMeetLink: doctorRow?.google_meet_link ?? '',
        consultationFee: doctorRow?.consultation_fee ? `${doctorRow.consultation_fee}` : '',
        followUpFee: doctorRow?.follow_up_fee ? `${doctorRow.follow_up_fee}` : '',
      };
      setProfile(merged);
      setEditedProfile(merged);
      setAvatarUrl(merged.avatarUrl);
      
      // Fetch treatment prices
      if (doctorRow?.id) {
        fetchTreatmentPrices(doctorRow.id);
      }
      
      setLoading(false);
    };
    fetchProfile();
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedProfile({ ...editedProfile, [e.target.name]: e.target.value });
  };

  const handleGetLiveLocation = () => {
    setLocationError(null);
    setGettingLocation(true);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setEditedProfile({ ...editedProfile, location: locationString });
        setGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setLocationError(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleCopyMeetLink = async () => {
    if (!data.googleMeetLink) return;
    
    try {
      await navigator.clipboard.writeText(data.googleMeetLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const fetchTreatmentPrices = async (doctorId: string) => {
    try {
      const res = await fetch(`/api/doctor/treatment-prices?doctorId=${doctorId}`);
      if (res.ok) {
        const data = await res.json();
        setTreatmentPrices(data.prices || []);
      }
    } catch (error) {
      console.error('Failed to fetch treatment prices:', error);
    }
  };

  const handleAddTreatment = async () => {
    if (!newTreatment.treatment_name || !newTreatment.price) {
      alert('Please fill in treatment name and price');
      return;
    }

    try {
      const res = await fetch('/api/doctor/treatment-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTreatment),
      });

      if (res.ok) {
        const data = await res.json();
        setTreatmentPrices([...treatmentPrices, data.price]);
        setNewTreatment({
          treatment_name: '',
          treatment_category: '',
          price: '',
          duration_minutes: '',
          description: '',
          is_active: true,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to add treatment:', error);
    }
  };

  const handleDeleteTreatment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this treatment?')) return;

    try {
      const res = await fetch(`/api/doctor/treatment-prices?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setTreatmentPrices(treatmentPrices.filter(t => t.id !== id));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to delete treatment:', error);
    }
  };

  const handleToggleTreatmentStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/doctor/treatment-prices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });

      if (res.ok) {
        setTreatmentPrices(treatmentPrices.map(t => 
          t.id === id ? { ...t, is_active: !currentStatus } : t
        ));
      }
    } catch (error) {
      console.error('Failed to update treatment status:', error);
    }
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = [
      profile.name,
      profile.specialty,
      profile.email,
      profile.phone,
      profile.location,
      profile.license,
      profile.experience,
      profile.certifications,
      profile.medicalCouncil,
      profile.registrationYear,
      profile.googleMeetLink,
      profile.consultationFee,
      profile.followUpFee,
      treatmentPrices.length > 0 ? 'treatments' : '',
    ];

    const filledFields = fields.filter(field => field && field.toString().trim() !== '').length;
    const totalFields = fields.length;
    const percentage = Math.round((filledFields / totalFields) * 100);

    return {
      percentage,
      filledFields,
      totalFields,
    };
  };

  const profileCompletion = calculateProfileCompletion();

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
          google_meet_link:    editedProfile.googleMeetLink || null,
          consultation_fee:    editedProfile.consultationFee ? parseFloat(editedProfile.consultationFee) || null : null,
          follow_up_fee:       editedProfile.followUpFee ? parseFloat(editedProfile.followUpFee) || null : null,
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

  // Get completion color based on percentage
  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getCompletionBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        
        {/* Profile Completion Indicator */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Profile Completion</p>
            <p className={`text-2xl font-bold ${getCompletionColor(profileCompletion.percentage)}`}>
              {profileCompletion.percentage}%
            </p>
          </div>
          <div className="relative w-20 h-20">
            <svg className="transform -rotate-90 w-20 h-20">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - profileCompletion.percentage / 100)}`}
                className={getCompletionBgColor(profileCompletion.percentage)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm font-bold ${getCompletionColor(profileCompletion.percentage)}`}>
                {profileCompletion.percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

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
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label htmlFor={`profile-${field}`} className="sr-only">{label}</label>
                          <input
                            id={`profile-${field}`}
                            type={type}
                            name={field}
                            value={editedProfile[field as keyof DoctorProfile]}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        {field === 'location' && (
                          <button
                            type="button"
                            onClick={handleGetLiveLocation}
                            disabled={gettingLocation}
                            className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            title="Get current location"
                          >
                            {gettingLocation ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Navigation className="w-4 h-4" />
                            )}
                            {gettingLocation ? 'Getting...' : 'Live Location'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="font-semibold text-gray-900">{data[field as keyof DoctorProfile] || '—'}</p>
                    )}
                    {field === 'location' && locationError && isEditing && (
                      <p className="text-xs text-red-500 mt-1">{locationError}</p>
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

          {/* Consultation Fees & Google Meet */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Consultation Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-gray-600">Consultation Fee (₹)</p>
                </div>
                {isEditing ? (
                  <>
                    <label htmlFor="consultationFee" className="sr-only">Consultation Fee</label>
                    <input
                      id="consultationFee"
                      type="number"
                      name="consultationFee"
                      value={editedProfile.consultationFee}
                      onChange={handleChange}
                      placeholder="e.g., 500"
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </>
                ) : (
                  <p className="font-semibold text-gray-900">
                    {data.consultationFee ? `₹${data.consultationFee}` : '—'}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-gray-600">Follow-up Fee (₹)</p>
                </div>
                {isEditing ? (
                  <>
                    <label htmlFor="followUpFee" className="sr-only">Follow-up Fee</label>
                    <input
                      id="followUpFee"
                      type="number"
                      name="followUpFee"
                      value={editedProfile.followUpFee}
                      onChange={handleChange}
                      placeholder="e.g., 300"
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </>
                ) : (
                  <p className="font-semibold text-gray-900">
                    {data.followUpFee ? `₹${data.followUpFee}` : '—'}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-5 h-5 text-purple-600" />
                  <p className="text-sm text-gray-600">Google Meet Link</p>
                </div>
                {isEditing ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <label htmlFor="googleMeetLink" className="sr-only">Google Meet Link</label>
                      <input
                        id="googleMeetLink"
                        type="url"
                        name="googleMeetLink"
                        value={editedProfile.googleMeetLink}
                        onChange={handleChange}
                        placeholder="https://meet.google.com/your-meeting-link"
                        className="flex-1 px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <a
                        href="https://meet.google.com/new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                      >
                        <Video className="w-4 h-4" />
                        Create New Meeting
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-xs text-gray-500">
                      Click "Create New Meeting" to start a Google Meet, then copy and paste the link here
                    </p>
                  </>
                ) : (
                  <>
                    {data.googleMeetLink ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <a
                          href={data.googleMeetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 font-semibold text-blue-600 hover:text-blue-700 hover:underline break-all"
                        >
                          {data.googleMeetLink}
                        </a>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCopyMeetLink}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm hover:shadow whitespace-nowrap"
                          >
                            {linkCopied ? (
                              <>
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="text-green-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy Link
                              </>
                            )}
                          </button>
                          <a
                            href={data.googleMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors shadow-md hover:shadow-lg whitespace-nowrap"
                          >
                            <Video className="w-4 h-4" />
                            Open Meeting
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="font-semibold text-gray-900">—</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Treatment Prices */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Treatment Pricing</h3>
              <button
                type="button"
                onClick={() => setEditingTreatments(!editingTreatments)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {editingTreatments ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                {editingTreatments ? 'Done' : 'Manage'}
              </button>
            </div>

            {/* Add New Treatment Form */}
            {editingTreatments && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-3">Add New Treatment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="treatment_name" className="text-xs text-gray-600 mb-1 block">
                      Treatment Name *
                    </label>
                    <input
                      id="treatment_name"
                      type="text"
                      value={newTreatment.treatment_name}
                      onChange={(e) => setNewTreatment({ ...newTreatment, treatment_name: e.target.value })}
                      placeholder="e.g., General Checkup"
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="treatment_category" className="text-xs text-gray-600 mb-1 block">
                      Category
                    </label>
                    <input
                      id="treatment_category"
                      type="text"
                      value={newTreatment.treatment_category}
                      onChange={(e) => setNewTreatment({ ...newTreatment, treatment_category: e.target.value })}
                      placeholder="e.g., Cardiology"
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="price" className="text-xs text-gray-600 mb-1 block">
                      Price (₹) *
                    </label>
                    <input
                      id="price"
                      type="number"
                      value={newTreatment.price}
                      onChange={(e) => setNewTreatment({ ...newTreatment, price: e.target.value })}
                      placeholder="e.g., 800"
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="duration_minutes" className="text-xs text-gray-600 mb-1 block">
                      Duration (minutes)
                    </label>
                    <input
                      id="duration_minutes"
                      type="number"
                      value={newTreatment.duration_minutes}
                      onChange={(e) => setNewTreatment({ ...newTreatment, duration_minutes: e.target.value })}
                      placeholder="e.g., 30"
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="description" className="text-xs text-gray-600 mb-1 block">
                      Description
                    </label>
                    <input
                      id="description"
                      type="text"
                      value={newTreatment.description}
                      onChange={(e) => setNewTreatment({ ...newTreatment, description: e.target.value })}
                      placeholder="Brief description of the treatment"
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddTreatment}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Treatment
                </button>
              </div>
            )}

            {/* Treatment List */}
            <div className="space-y-3">
              {treatmentPrices.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No treatments added yet. Click "Manage" to add your treatment pricing.
                </p>
              ) : (
                treatmentPrices.map((treatment) => (
                  <div
                    key={treatment.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      treatment.is_active
                        ? 'bg-white border-blue-200'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{treatment.treatment_name}</h4>
                          {treatment.treatment_category && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {treatment.treatment_category}
                            </span>
                          )}
                          {!treatment.is_active && (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        {treatment.description && (
                          <p className="text-sm text-gray-600 mb-2">{treatment.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-semibold text-green-600">₹{treatment.price}</span>
                          {treatment.duration_minutes && (
                            <span className="text-gray-500">{treatment.duration_minutes} mins</span>
                          )}
                        </div>
                      </div>
                      {editingTreatments && (
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            type="button"
                            onClick={() => handleToggleTreatmentStatus(treatment.id!, treatment.is_active)}
                            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                              treatment.is_active
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {treatment.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTreatment(treatment.id!)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Delete treatment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
