import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseServer } from '@/lib/supabaseServer'

async function getPatientRow(email: string) {
  const { data } = await supabaseServer
    .from('users').select('id, role, full_name').eq('email', email).single()
  if (!data || data.role !== 'patient') return null
  return data
}

// POST /api/patient/call-logs â€” save a voice assistant call log and notify doctors
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const patient = await getPatientRow(session.user.email)
  if (!patient) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { duration, transcript, summary, intent } = body

  if (!transcript && !summary)
    return NextResponse.json({ error: 'No log content provided' }, { status: 400 })

  const patientName = patient.full_name ?? session.user.email

  // Save the call log
  const { data: log, error } = await supabaseServer
    .from('call_logs')
    .insert({
      patient_id: patient.id,
      patient_name: patientName,
      duration_secs: duration ?? 0,
      transcript: transcript ?? '',
      summary: summary ?? '',
      intent: intent ?? 'general',
    })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify all doctors linked to this patient
  const { data: links } = await supabaseServer
    .from('doctor_patients')
    .select('doctor_id')
    .eq('patient_id', patient.id)

  if (links && links.length > 0) {
    const intentLabel =
      intent === 'appointment' ? 'ðŸ“… Appointment Request'
      : intent === 'lab' ? 'ðŸ§ª Lab Test Request'
      : intent === 'prescription' ? 'ðŸ’Š Prescription Query'
      : 'ðŸ’¬ General Health Query'

    const notifMessage = summary
      ? `${patientName} spoke with the AI receptionist (${intentLabel}).\n\nSummary: ${summary}`
      : `${patientName} had a voice call with the AI receptionist (${intentLabel}). Duration: ${Math.floor((duration ?? 0) / 60)}m ${(duration ?? 0) % 60}s.`

    const notifications = links.map((l: { doctor_id: string }) => ({
      doctor_id: l.doctor_id,
      title: `Voice Call Log â€” ${patientName}`,
      message: notifMessage,
      type: intent === 'appointment' ? 'appointment' : intent === 'lab' ? 'result' : 'system',
    }))

    await supabaseServer.from('doctor_notifications').insert(notifications)
  }

  return NextResponse.json({ log })
}

// GET /api/patient/call-logs â€” fetch patient's own call logs
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const patient = await getPatientRow(session.user.email)
  if (!patient) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseServer
    .from('call_logs')
    .select('*')
    .eq('patient_id', patient.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ logs: data ?? [] })
}
