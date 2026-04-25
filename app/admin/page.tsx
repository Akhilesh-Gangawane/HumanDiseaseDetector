import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabaseServer'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')

  // Server-side role check — never trust client-only guards
  const { data: user } = await supabaseServer
    .from('users')
    .select('role')
    .eq('email', session.user.email)
    .single()

  if (!user || user.role !== 'admin') redirect('/')

  return <AdminDashboard />
}
