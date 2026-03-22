import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pathology & Lab Tests',
  description: 'Book pathology tests and lab diagnostics from the comfort of your home.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
