import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseServer } from '@/lib/supabaseServer'

// GET /api/patient/recordings â€” fetch recordings the doctor has shared with this patient
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
    .select('*, appointments(appointment_date, appointment_time, type), users!doctor_id(full_name)')
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
    appointmentDate: (r.appointments as { appointment_date?: string } | null)?.appointment_date ?? '',
    appointmentTime: (r.appointments as { appointment_time?: string } | null)?.appointment_time ?? '',
    appointmentType: (r.appointments as { type?: string } | null)?.type ?? '',
    createdAt: r.created_at,
  }))

  return NextResponse.json({ recordings })
}
