import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseServer } from '@/lib/supabaseServer'

// GET /api/patient/recordings — fetch recordings the doctor has shared with this patient
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userRow } = await supabaseServer
    .from('users').select('id, role').eq('email', session.user.email).single()

  if (!userRow || userRow.role !== 'patient')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Only return recordings where shared = true
  const { data, error } = await supabaseServer
    .from('consultation_recordings')
    .select('*, appointments(date, time, type), users!doctor_id(full_name)')
    .eq('patient_id', userRow.id)
    .eq('shared', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const recordings = (data ?? []).map(r => ({
    id: r.id,
    title: r.title,
    recordingUrl: r.recording_url,
    durationMins: r.duration_mins,
    notes: r.notes ?? '',
    doctorName: (r.users as { full_name?: string } | null)?.full_name ?? 'Doctor',
    appointmentDate: (r.appointments as { date?: string } | null)?.date ?? '',
    appointmentTime: (r.appointments as { time?: string } | null)?.time ?? '',
    appointmentType: (r.appointments as { type?: string } | null)?.type ?? '',
    createdAt: r.created_at,
  }))

  return NextResponse.json({ recordings })
}
