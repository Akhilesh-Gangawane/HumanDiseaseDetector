'use client';

import { useState, useEffect, Suspense, lazy } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft, Loader2 } from 'lucide-react';
import DoctorNavbar from '@/components/doctor/DoctorNavbar';
import DoctorHero from '@/components/doctor/DoctorHero';
import DoctorFeatureCards from '@/components/doctor/DoctorFeatureCards';
import NeuralNetworkContainer from '@/components/ui/NeuralNetworkContainer';
import Footer from '@/components/patient/Footer';

// Lazy-load heavy tab components — only fetched when the tab is first opened
const DashboardOverview = dynamic(() => import('@/components/doctor/DashboardOverview'), { loading: () => <TabLoader /> });
const PatientManagement = dynamic(() => import('@/components/doctor/PatientManagement'), { loading: () => <TabLoader /> });
const AIPredictionReview = dynamic(() => import('@/components/doctor/AIPredictionReview'), { loading: () => <TabLoader /> });
const MedicineReview = dynamic(() => import('@/components/doctor/MedicineReview'), { loading: () => <TabLoader /> });
const ConsultDoctor = dynamic(() => import('@/components/doctor/ConsultDoctor'), { loading: () => <TabLoader /> });
const ProgressTracker = dynamic(() => import('@/components/doctor/ProgressTracker'), { loading: () => <TabLoader /> });
const PrescriptionGenerator = dynamic(() => import('@/components/doctor/PrescriptionGenerator'), { loading: () => <TabLoader /> });
const ReportsAnalytics = dynamic(() => import('@/components/doctor/ReportsAnalytics'), { loading: () => <TabLoader /> });
const AppointmentsPage = dynamic(() => import('@/components/doctor/AppointmentsPage'), { loading: () => <TabLoader /> });
const ProfilePage = dynamic(() => import('@/components/doctor/ProfilePage'), { loading: () => <TabLoader /> });
const SettingsPage = dynamic(() => import('@/components/doctor/SettingsPage'), { loading: () => <TabLoader /> });
const LabPathology = dynamic(() => import('@/components/doctor/LabPathology'), { loading: () => <TabLoader /> });
const NotificationsPage = dynamic(() => import('@/components/doctor/NotificationsPage'), { loading: () => <TabLoader /> });

function TabLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );
}

const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  dashboard: DashboardOverview,
  patients: PatientManagement,
  'ai-predictions': AIPredictionReview,
  'medicine-reviews': MedicineReview,
  'consult-doctors': ConsultDoctor,
  'progress-tracker': ProgressTracker,
  prescriptions: PrescriptionGenerator,
  reports: ReportsAnalytics,
  'lab-pathology': LabPathology,
  appointments: AppointmentsPage,
  profile: ProfilePage,
  settings: SettingsPage,
  notifications: NotificationsPage,
};

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  const TabContent = TAB_COMPONENTS[activeTab] ?? DashboardOverview;

  return (
    <NeuralNetworkContainer className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white">
      <DoctorNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="pt-16 relative w-full h-full min-h-screen">
        {activeTab === 'dashboard' && (
          <>
            <DoctorHero setActiveTab={setActiveTab} />
            <div className="relative mx-4 md:mx-auto">
              <DoctorFeatureCards setActiveTab={setActiveTab} />
            </div>
            <Footer />
          </>
        )}

        {activeTab !== 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="mb-6 flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200/50 shadow-sm w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-semibold text-sm">Back to Dashboard Home</span>
            </button>
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/60 overflow-hidden min-h-[70vh]">
              <Suspense fallback={<TabLoader />}>
                <TabContent />
              </Suspense>
            </div>
          </div>
        )}
      </main>
    </NeuralNetworkContainer>
  );
}
