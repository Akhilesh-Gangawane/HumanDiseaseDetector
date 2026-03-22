import type { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Doctor Dashboard',
  description: 'Manage patients, AI predictions, prescriptions, and appointments from your doctor dashboard.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardClient>{children}</DashboardClient>;
}
