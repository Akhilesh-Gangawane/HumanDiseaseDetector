import type { Metadata, Viewport } from 'next'
import './globals.css'
import LenisProvider from '@/components/LenisProvider'
import LoadingTransition from '@/components/LoadingTransition'

export const metadata: Metadata = {
  title: {
    default: 'Dhanvantari AI - Smart Healthcare Monitoring',
    template: '%s | Dhanvantari AI',
  },
  description: 'AI-powered healthcare monitoring and disease prediction system with 98% accuracy',
  keywords: ['healthcare', 'AI', 'disease prediction', 'telemedicine', 'health monitoring'],
  openGraph: {
    type: 'website',
    siteName: 'Dhanvantari AI',
    title: 'Dhanvantari AI - Smart Healthcare Monitoring',
    description: 'AI-powered healthcare monitoring and disease prediction system with 98% accuracy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dhanvantari AI',
    description: 'AI-powered healthcare monitoring and disease prediction',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <LoadingTransition />
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  )
}
