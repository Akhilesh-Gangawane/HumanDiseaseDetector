import type { Metadata } from 'next'
import './globals.css'
import LenisProvider from '@/components/LenisProvider'
import LoadingTransition from '@/components/LoadingTransition'

export const metadata: Metadata = {
  title: 'Dhanvantari AI - Smart Healthcare Monitoring',
  description: 'AI-powered healthcare monitoring and disease prediction system with 98% accuracy',
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
