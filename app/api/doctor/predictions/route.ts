import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseServer } from '@/lib/supabaseServer'

async function getDoctorId(email: string) {
  const { data } = await supabaseServer
    .from('users').select('id, role').eq('email', email).single()
  if (!data || data.role !== 'doctor') return null
  return data.id as string
}

// GET /api/doctor/predictions
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctorId = await getDoctorId(session.user.email)
  if (!doctorId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Get assigned patient IDs
  const { data: links } = await supabaseServer
    .from('doctor_patients').select('patient_id').eq('doctor_id', doctorId)
  const patientIds = (links ?? []).map(l => l.patient_id)

  let data, error
  if (patientIds.length > 0) {
    ;({ data, error } = await supabaseServer
      .from('ai_predictions')
      .select('*')
      .or(`doctor_id.eq.${doctorId},and(initiated_by.eq.patient,patient_id.in.(${patientIds.join(',')}))`)
      .order('created_at', { ascending: false }))
  } else {
    ;({ data, error } = await supabaseServer
      .from('ai_predictions')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false }))
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const predictions = (data ?? []).map(p => ({
    id: p.id,
    patient: p.patient_name,
    disease: p.disease,
    confidence: p.confidence,
    symptoms: p.symptoms ?? [],
    explanation: p.explanation ?? '',
    status: p.status,
    initiatedBy: p.initiated_by ?? 'doctor',
  }))

  return NextResponse.json({ predictions })
}

// POST /api/doctor/predictions â€” save a new prediction
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctorId = await getDoctorId(session.user.email)
  if (!doctorId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { patientName, patientId, disease, confidence, symptoms, explanation } = body

  if (!patientName || !disease || confidence === undefined)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const { data, error } = await supabaseServer
    .from('ai_predictions')
    .insert({
      doctor_id: doctorId,
      patient_id: patientId ?? null,
      patient_name: patientName,
      disease,
      confidence,
      symptoms: symptoms ?? [],
      explanation: explanation ?? '',
      status: 'Pending',
      initiated_by: 'doctor',
    })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify patient if patient_id is known
  if (patientId) {
    await supabaseServer.from('patient_notifications').insert({
      patient_id: patientId,
      doctor_id: doctorId,
      title: 'AI Prediction Result',
      message: `Your doctor has reviewed an AI prediction: ${disease} (${confidence}% confidence). Status: Pending review.`,
      type: 'result',
    })
  }

  return NextResponse.json({
    prediction: { id: data.id, patient: data.patient_name, disease: data.disease, confidence: data.confidence, symptoms: data.symptoms, explanation: data.explanation, status: data.status, initiatedBy: 'doctor' }
  })
}

// PATCH /api/doctor/predictions â€” update status
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctorId = await getDoctorId(session.user.email)
  if (!doctorId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })

  const { data: existing } = await supabaseServer
    .from('ai_predictions').select('patient_id, patient_name, disease').eq('id', id).single()

  const { error } = await supabaseServer
    .from('ai_predictions')
    .update({ status })
    .eq('id', id)
    .eq('doctor_id', doctorId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify patient of status change
  if (existing?.patient_id) {
    await supabaseServer.from('patient_notifications').insert({
      patient_id: existing.patient_id,
      doctor_id: doctorId,
      title: 'Prediction Status Updated',
      message: `Your AI prediction for ${existing.disease} has been ${status.toLowerCase()} by your doctor.`,
      type: 'result',
    })
  }

  return NextResponse.json({ success: true })
}
