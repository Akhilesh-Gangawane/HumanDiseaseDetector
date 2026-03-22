'use client';

import PatientNavbar from '@/components/patient/PatientNavbar';
import PatientProfile from '@/components/patient/PatientProfile';
import Footer from '@/components/patient/Footer';
import NeuralNetworkContainer from '@/components/ui/NeuralNetworkContainer';

export default function ProfilePage() {
  return (
    <NeuralNetworkContainer className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white">
      <PatientNavbar />
      <PatientProfile />
      <Footer />
    </NeuralNetworkContainer>
  );
}
