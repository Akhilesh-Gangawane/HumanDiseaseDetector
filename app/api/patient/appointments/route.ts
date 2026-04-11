import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseServer } from '@/lib/supabaseServer'

// GET /api/patient/appointments — fetch appointments where patient_id matches logged-in patient
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userRow } = await supabaseServer
    .from('users').select('id, role').eq('email', session.user.email).single()

  if (!userRow || userRow.role !== 'patient')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseServer
    .from('appointments')
    .select('*, users!doctor_id(full_name, email)')
    .eq('patient_id', userRow.id)
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const appointments = (data ?? []).map(a => ({
    id: a.id,
    doctorName: (a.users as { full_name?: string; email?: string } | null)?.full_name ?? 'Doctor',
    date: a.date,
    time: a.time,
    type: a.type,
    mode: a.mode,
    status: a.status,
  }))

  return NextResponse.json({ appointments })
}
