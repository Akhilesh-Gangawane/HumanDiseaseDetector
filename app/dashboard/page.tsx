'use client';

import { useState } from 'react';
import Sidebar from '@/components/doctor/Sidebar';
import DashboardOverview from '@/components/doctor/DashboardOverview';
import PatientManagement from '@/components/doctor/PatientManagement';
import AIPredictionReview from '@/components/doctor/AIPredictionReview';
import MedicineReview from '@/components/doctor/MedicineReview';
import ConsultDoctor from '@/components/doctor/ConsultDoctor';
import ProgressTracker from '@/components/doctor/ProgressTracker';
import PrescriptionGenerator from '@/components/doctor/PrescriptionGenerator';
import ReportsAnalytics from '@/components/doctor/ReportsAnalytics';
import AppointmentsPage from '@/components/doctor/AppointmentsPage';
import ProfilePage from '@/components/doctor/ProfilePage';

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'patients':
        return <PatientManagement />;
      case 'ai-predictions':
        return <AIPredictionReview />;
      case 'medicine-reviews':
        return <MedicineReview />;
      case 'consult-doctors':
        return <ConsultDoctor />;
      case 'progress-tracker':
        return <ProgressTracker />;
      case 'prescriptions':
        return <PrescriptionGenerator />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'appointments':
        return <AppointmentsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'notifications':
        return <DashboardOverview />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {renderContent()}
      </main>
    </div>
  );
}
