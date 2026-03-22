import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buy Medicine',
  description: 'Order medicines online with fast delivery. Browse our wide range of healthcare products.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
