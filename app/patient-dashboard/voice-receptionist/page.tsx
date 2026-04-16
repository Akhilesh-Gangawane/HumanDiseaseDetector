'use client';

import PatientNavbar from '@/components/patient/PatientNavbar';
import Footer from '@/components/patient/Footer';
import VoiceAssistant from '@/components/patient/VoiceAssistant';
import NeuralNetworkContainer from '@/components/ui/NeuralNetworkContainer';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function VoiceReceptionistPage() {
  const router = useRouter();

  return (
    <NeuralNetworkContainer className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <PatientNavbar />

      <div className="pt-24 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <button
          type="button"
          onClick={() => router.push('/patient-dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white/80 hover:text-white transition-all duration-300 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Dashboard</span>
        </button>
      </div>

      <VoiceAssistant />

      <Footer />
    </NeuralNetworkContainer>
  );
}
