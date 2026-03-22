import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consult a Doctor',
  description: 'Connect with qualified doctors online for consultations, prescriptions, and health advice.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
