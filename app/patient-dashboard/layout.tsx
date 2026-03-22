import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Patient Dashboard',
  description: 'Manage your health, appointments, orders, and AI predictions from your personal dashboard.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
