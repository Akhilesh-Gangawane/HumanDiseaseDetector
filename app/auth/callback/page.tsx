'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// This page handles post-OAuth redirect — reads the role from session and sends to correct dashboard
export default function AuthCallback() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.replace('/login')
      return
    }
    const role = (session?.user as any)?.role
    router.replace(role === 'doctor' ? '/dashboard' : '/patient-dashboard')
  }, [status, session, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
