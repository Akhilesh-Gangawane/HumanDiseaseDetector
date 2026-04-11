'use client';

import { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Heart, Activity, 
  FileText, Edit2, Save, X, Camera, Shield, Clock, 
  Droplet, Scale, Ruler, AlertCircle, CheckCircle2, ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
interface PatientInfo {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  
  // Address
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Medical Information
  height: string;
  weight: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  
  // Insurance
  insuranceProvider: string;
  insuranceNumber: string;
  policyHolder: string;
}

const initialPatientData: PatientInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  height: '',
  weight: '',
  allergies: [],
  chronicConditions: [],
  currentMedications: [],
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
  insuranceProvider: '',
  insuranceNumber: '',
  policyHolder: '',
};

export default function PatientProfile() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [patientData, setPatientData] = useState<PatientInfo>(initialPatientData);
  const [editedData, setEditedData] = useState<PatientInfo>(initialPatientData);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [loading, setLoading] = useState(true);

  // Load user + patient data via API route (uses service role, bypasses RLS)
  useEffect(() => {
    if (!session?.user?.email) return;
    const fetchProfile = async () => {
      setLoading(true);
      const res = await fetch('/api/user/profile');
      if (!res.ok) { setLoading(false); return; }
      const { user: userRow, patient: patientRow } = await res.json();

      const nameParts = (userRow.full_name ?? '').split(' ');
      const merged: PatientInfo = {
        firstName: patientRow?.first_name ?? nameParts[0] ?? '',
        lastName: patientRow?.last_name ?? nameParts.slice(1).join(' ') ?? '',
        email: userRow.email ?? '',
        phone: patientRow?.phone ?? '',
        dateOfBirth: patientRow?.date_of_birth ?? '',
        gender: patientRow?.gender ?? '',
        bloodGroup: patientRow?.blood_group ?? '',
        address: patientRow?.address ?? '',
        city: patientRow?.city ?? '',
        state: patientRow?.state ?? '',
        zipCode: patientRow?.zip_code ?? '',
        country: patientRow?.country ?? '',
        height: patientRow?.height_cm?.toString() ?? '',
        weight: patientRow?.weight_kg?.toString() ?? '',
        allergies: patientRow?.allergies ?? [],
        chronicConditions: patientRow?.chronic_conditions ?? [],
        currentMedications: patientRow?.current_medications ?? [],
        emergencyContactName: patientRow?.emergency_contact_name ?? '',
        emergencyContactPhone: patientRow?.emergency_contact_phone ?? '',
        emergencyContactRelation: patientRow?.emergency_contact_relation ?? '',
        insuranceProvider: patientRow?.insurance_provider ?? '',
        insuranceNumber: patientRow?.insurance_number ?? '',
        policyHolder: patientRow?.policy_holder ?? '',
      };
      setPatientData(merged);
      setEditedData(merged);
      setLoading(false);
    };
    fetchProfile();
  }, [session]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(patientData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(patientData);
  };

  const handleSave = async () => {
    setPatientData(editedData);
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: `${editedData.firstName} ${editedData.lastName}`.trim(),
        patient: {
          first_name: editedData.firstName,
          last_name: editedData.lastName,
          phone: editedData.phone,
          date_of_birth: editedData.dateOfBirth,
          gender: editedData.gender,
          blood_group: editedData.bloodGroup,
          address: editedData.address,
          city: editedData.city,
          state: editedData.state,
          zip_code: editedData.zipCode,
          country: editedData.country,
          height_cm: editedData.height ? parseFloat(editedData.height) : null,
          weight_kg: editedData.weight ? parseFloat(editedData.weight) : null,
          allergies: editedData.allergies,
          chronic_conditions: editedData.chronicConditions,
          current_medications: editedData.currentMedications,
          emergency_contact_name: editedData.emergencyContactName,
          emergency_contact_phone: editedData.emergencyContactPhone,
          emergency_contact_relation: editedData.emergencyContactRelation,
          insurance_provider: editedData.insuranceProvider,
          insurance_number: editedData.insuranceNumber,
          policy_holder: editedData.policyHolder,
        },
      }),
    });
  };

  const handleInputChange = (field: keyof PatientInfo, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = (field: 'allergies' | 'chronicConditions' | 'currentMedications', value: string) => {
    if (value.trim()) {
      setEditedData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      if (field === 'allergies') setNewAllergy('');
      if (field === 'chronicConditions') setNewCondition('');
      if (field === 'currentMedications') setNewMedication('');
    }
  };

  const removeItem = (field: 'allergies' | 'chronicConditions' | 'currentMedications', index: number) => {
    setEditedData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateBMI = (height: string, weight: string) => {
    const h = parseFloat(height) / 100; // convert cm to m
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      return (w / (h * h)).toFixed(1);
    }
    return 'N/A';
  };

  const data = isEditing ? editedData : patientData;
  const bmi = calculateBMI(data.height, data.weight);
  const age = calculateAge(data.dateOfBirth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 pt-20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.push('/patient-dashboard')}
          className="mb-6 flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 group"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
          <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">Back to Home</span>
        </button>

        {/* Success Message */}
        {showSuccess && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in">
            <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-semibold">Profile updated successfully!</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                  {data.firstName[0]}{data.lastName[0]}
                </div>
                <button 
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform border-2 border-blue-500"
                  aria-label="Change profile picture"
                >
                  <Camera className="w-5 h-5 text-blue-600" />
                </button>
              </div>

              {/* Basic Info */}
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  {data.firstName} {data.lastName}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{age} years old</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Droplet className="w-4 h-4" />
                    <span>{data.bloodGroup}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{data.gender}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <Edit2 className="w-5 h-5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300 flex items-center space-x-2"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Stats */}
          <div className="space-y-6">
            {/* Health Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <Activity className="w-6 h-6 text-blue-600" />
                <span>Health Stats</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Ruler className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700 font-medium">Height</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800">{data.height} cm</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-teal-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Scale className="w-5 h-5 text-teal-600" />
                    <span className="text-gray-700 font-medium">Weight</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800">{data.weight} kg</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-700 font-medium">BMI</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800">{bmi}</span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <span>Emergency Contact</span>
              </h3>
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editedData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    placeholder="Contact Name"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={editedData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    placeholder="Contact Phone"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={editedData.emergencyContactRelation}
                    onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                    placeholder="Relation"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-semibold text-gray-800">{data.emergencyContactName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-semibold text-gray-800">{data.emergencyContactPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Relation</p>
                    <p className="font-semibold text-gray-800">{data.emergencyContactRelation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <User className="w-6 h-6 text-blue-600" />
                <span>Personal Information</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  value={data.firstName}
                  isEditing={isEditing}
                  onChange={(value) => handleInputChange('firstName', value)}
                  icon={<User className="w-5 h-5 text-gray-400" />}
                />
                <InputField
                  label="Last Name"
                  value={data.lastName}
                  isEditing={isEditing}
                  onChange={(value) => handleInputChange('lastName', value)}
                  icon={<User className="w-5 h-5 text-gray-400" />}
                />
                <InputField
                  label="Email"
                  value={data.email}
                  isEditing={isEditing}
                  onChange={(value) => handleInputChange('email', value)}
                  icon={<Mail className="w-5 h-5 text-gray-400" />}
                  type="email"
                />
                <InputField
                  label="Phone"
                  value={data.phone}
                  isEditing={isEditing}
                  onChange={(value) => handleInputChange('phone', value)}
                  icon={<Phone className="w-5 h-5 text-gray-400" />}
                  type="tel"
                />
                <InputField
                  label="Date of Birth"
                  value={data.dateOfBirth}
                  isEditing={isEditing}
                  onChange={(value) => handleInputChange('dateOfBirth', value)}
                  icon={<Calendar className="w-5 h-5 text-gray-400" />}
                  type="date"
                />
                <SelectField
                  label="Gender"
                  value={data.gender}
                  isEditing={isEditing}
                  onChange={(value) => handleInputChange('gender', value)}
                  options={['Male', 'Female', 'Other']}
                />
                <SelectField
                  label="Blood Group"
                  value={data.bloodGroup}
                  isEditing={isEditing}
                  onChange={(value) => handleInputChange('bloodGroup', value)}
                  options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                <span>Address</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <InputField
                    label="Street Address"
                    value={data.address}
                    isEditing={isEditing}
                    onChange={(value) => handleInputChange('address', value)}
                  />
                </div>
                <InputField
                  label="City"
                  value={data.city}
                  isEditing={isEditing}
                  onChange={(value) => handleInputChange('city', value)}
                />
                <InputField
                  label="State"
                  value={data.state}
                  isEditing={isEditing}
                  onChange={(value) => handleInputChange('state', value)}
                />
                <InputField
                  label="ZIP Code"
                  value={data.zipCode}
                  isEditing={isEditing}
                  onChange={(value) => handleInputChange('zipCode', value)}
                />
                <InputField
                  label="Country"
                  value={data.country}
                  isEditing={isEditing}
                  onChange={(value) => handleInputChange('country', value)}
                />
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <Heart className="w-6 h-6 text-red-600" />
                <span>Medical Information</span>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <InputField
                  label="Height (cm)"
                  value={data.height}
                  isEditing={isEditing}
                  onChange={(value) => handleInputChange('height', value)}
                  type="number"
                />
                <InputField
                  label="Weight (kg)"
                  value={data.weight}
                  isEditing={isEditing}
                  onChange={(value) => handleInputChange('weight', value)}
                  type="number"
                />
              </div>

              {/* Allergies */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Allergies</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {data.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                    >
                      <span>{allergy}</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeItem('allergies', index)}
                          className="hover:bg-red-200 rounded-full p-1"
                          aria-label={`Remove ${allergy}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addItem('allergies', newAllergy)}
                      placeholder="Add new allergy"
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => addItem('allergies', newAllergy)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Chronic Conditions */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Chronic Conditions</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {data.chronicConditions.map((condition, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium"
                    >
                      <span>{condition}</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeItem('chronicConditions', index)}
                          className="hover:bg-yellow-200 rounded-full p-1"
                          aria-label={`Remove ${condition}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addItem('chronicConditions', newCondition)}
                      placeholder="Add chronic condition"
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => addItem('chronicConditions', newCondition)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Current Medications */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Medications</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {data.currentMedications.map((medication, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                    >
                      <span>{medication}</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeItem('currentMedications', index)}
                          className="hover:bg-green-200 rounded-full p-1"
                          aria-label={`Remove ${medication}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addItem('currentMedications', newMedication)}
                      placeholder="Add medication"
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => addItem('currentMedications', newMedication)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Insurance Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <span>Insurance Information</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label="Insurance Provider"
                  value={data.insuranceProvider}
                  isEditing={isEditing}
                  onChange={(value) => handleInputChange('insuranceProvider', value)}
                />
                <InputField
                  label="Insurance Number"
                  value={data.insuranceNumber}
                  isEditing={isEditing}
                  onChange={(value) => handleInputChange('insuranceNumber', value)}
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Policy Holder"
                    value={data.policyHolder}
                    isEditing={isEditing}
                    onChange={(value) => handleInputChange('policyHolder', value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  type?: string;
}

function InputField({ label, value, isEditing, onChange, icon, type = 'text' }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      {isEditing ? (
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={label}
            className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
          />
        </div>
      ) : (
        <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-xl">
          {icon}
          <p className="text-gray-800 font-medium">{value}</p>
        </div>
      )}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  options: string[];
}

function SelectField({ label, value, isEditing, onChange, options }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      {isEditing ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        >
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <div className="px-4 py-2 bg-gray-50 rounded-xl">
          <p className="text-gray-800 font-medium">{value}</p>
        </div>
      )}
    </div>
  );
}
