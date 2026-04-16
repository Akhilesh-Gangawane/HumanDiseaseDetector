import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseServer } from '@/lib/supabaseServer'

async function getDoctorRow(email: string) {
  const { data } = await supabaseServer
    .from('users').select('id, role, full_name').eq('email', email).single()
  if (!data || data.role !== 'doctor') return null
  return data
}

// GET /api/doctor/recordings — fetch all recordings the doctor has added
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctor = await getDoctorRow(session.user.email)
  if (!doctor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseServer
    .from('consultation_recordings')
    .select('*, appointments(patient_name, date, time)')
    .eq('doctor_id', doctor.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ recordings: data ?? [] })
}

// POST /api/doctor/recordings — doctor adds a recording link for an appointment
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctor = await getDoctorRow(session.user.email)
  if (!doctor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { appointmentId, patientId, title, recordingUrl, durationMins, notes } = body

  if (!appointmentId || !recordingUrl || !title)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const { data, error } = await supabaseServer
    .from('consultation_recordings')
    .insert({
      appointment_id: appointmentId,
      doctor_id: doctor.id,
      patient_id: patientId ?? null,
      title,
      recording_url: recordingUrl,
      duration_mins: durationMins ?? null,
      notes: notes ?? '',
      shared: false, // not shared by default — doctor must explicitly share
    })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ recording: data })
}

// PATCH /api/doctor/recordings — toggle shared status (share/unshare with patient)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctor = await getDoctorRow(session.user.email)
  if (!doctor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, shared } = await req.json()
  if (!id || shared === undefined) return NextResponse.json({ error: 'Missing id or shared' }, { status: 400 })

  const { data: rec } = await supabaseServer
    .from('consultation_recordings')
    .select('patient_id, title')
    .eq('id', id)
    .eq('doctor_id', doctor.id)
    .single()

  if (!rec) return NextResponse.json({ error: 'Recording not found' }, { status: 404 })

  const { error } = await supabaseServer
    .from('consultation_recordings')
    .update({ shared })
    .eq('id', id)
    .eq('doctor_id', doctor.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify patient when doctor shares the recording
  if (shared && rec.patient_id) {
    await supabaseServer.from('patient_notifications').insert({
      patient_id: rec.patient_id,
      doctor_id: doctor.id,
      title: 'Consultation Recording Available',
      message: `Dr. ${doctor.full_name ?? 'Your doctor'} has shared the recording: "${rec.title}". You can view it in your Health Records.`,
      type: 'result',
    })
  }

  return NextResponse.json({ success: true })
}

// DELETE /api/doctor/recordings — delete a recording
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctor = await getDoctorRow(session.user.email)
  if (!doctor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabaseServer
    .from('consultation_recordings')
    .delete()
    .eq('id', id)
    .eq('doctor_id', doctor.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
