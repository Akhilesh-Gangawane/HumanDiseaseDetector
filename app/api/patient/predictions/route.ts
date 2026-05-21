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

// POST /api/patient/predictions â€” patient runs a prediction, saves it, notifies all their doctors
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const patient = await getPatientRow(session.user.email)
  if (!patient) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { disease, confidence, symptoms, explanation } = body

  if (!disease || confidence === undefined)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const { data, error } = await supabaseServer
    .from('ai_predictions')
    .insert({
      doctor_id: null,
      patient_id: patient.id,
      patient_name: patient.full_name ?? session.user.email,
      disease,
      confidence,
      symptoms: symptoms ?? [],
      explanation: explanation ?? '',
      status: 'Pending',
      initiated_by: 'patient',
    })
    .select().single()

  if (error) {
    console.error('[POST /api/patient/predictions] Supabase insert error:', error)
    return NextResponse.json({ error: error.message ?? error.details ?? 'Database error' }, { status: 500 })
  }

  // Notify all doctors assigned to this patient
  const { data: links } = await supabaseServer
    .from('doctor_patients')
    .select('doctor_id')
    .eq('patient_id', patient.id)

  if (links && links.length > 0) {
    const notifications = links.map(l => ({
      doctor_id: l.doctor_id,
      title: 'Patient Self-Prediction',
      message: `${patient.full_name ?? 'Your patient'} ran an AI prediction: ${disease} (${confidence}% confidence). Please review.`,
      type: 'result' as const,
    }))
    await supabaseServer.from('doctor_notifications').insert(notifications)
  }

  return NextResponse.json({ prediction: data })
}

// GET /api/patient/predictions â€” fetch patient's own predictions
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const patient = await getPatientRow(session.user.email)
  if (!patient) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseServer
    .from('ai_predictions')
    .select('*')
    .eq('patient_id', patient.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ predictions: data ?? [] })
}
