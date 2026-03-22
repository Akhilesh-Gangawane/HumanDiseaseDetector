import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Knowledge Center',
  description: 'Explore health articles, guides, and medical knowledge curated by healthcare professionals.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
