import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Health Policy',
  description: 'Explore health insurance policies and coverage options tailored for you.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
