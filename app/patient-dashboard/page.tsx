'use client';

import PatientNavbar from '@/components/patient/PatientNavbar';
import HeroSection from '@/components/patient/HeroSection';
import FeatureCards from '@/components/patient/FeatureCards';
import ServicesSection from '@/components/patient/ServicesSection';
import Footer from '@/components/patient/Footer';
import NeuralNetworkContainer from '@/components/ui/NeuralNetworkContainer';

export default function PatientDashboard() {
  return (
    <NeuralNetworkContainer className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white">
      <PatientNavbar />
      
      <HeroSection />

      <FeatureCards />

      <ServicesSection />

      <Footer />
    </NeuralNetworkContainer>
  );
}

