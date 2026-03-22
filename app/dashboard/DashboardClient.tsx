'use client';

import { DoctorStateProvider } from '@/components/doctor/DoctorStateContext';

export default function DashboardClient({ children }: { children: React.ReactNode }) {
  return <DoctorStateProvider>{children}</DoctorStateProvider>;
}
