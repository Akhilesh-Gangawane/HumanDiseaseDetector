import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseServer } from '@/lib/supabaseServer'

// GET /api/patient/records â€” fetch predictions, lab tests, vitals, prescriptions for the patient
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userRow } = await supabaseServer
    .from('users').select('id, role, full_name').eq('email', session.user.email).single()

  if (!userRow || userRow.role !== 'patient')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const patientName = userRow.full_name ?? ''

  // Fetch predictions by patient_id or patient_name match
  const [predictionsRes, labTestsRes, vitalsRes, prescriptionsRes] = await Promise.all([
    supabaseServer
      .from('ai_predictions')
      .select('*, users!doctor_id(full_name)')
      .eq('patient_id', userRow.id)
      .order('created_at', { ascending: false }),

    supabaseServer
      .from('lab_tests')
      .select('*, doctor:doctor_id(full_name)')
      .eq('patient_id', userRow.id)
      .order('created_at', { ascending: false }),

    supabaseServer
      .from('patient_vitals')
      .select('*')
      .eq('patient_id', userRow.id)
      .order('date', { ascending: false })
      .limit(10),

    supabaseServer
      .from('prescriptions')
      .select('*, users!doctor_id(full_name)')
      .eq('patient_id', userRow.id)
      .order('created_at', { ascending: false }),
  ])

  const predictions = (predictionsRes.data ?? []).map(p => ({
    id: p.id,
    disease: p.disease,
    confidence: p.confidence,
    symptoms: p.symptoms ?? [],
    explanation: p.explanation ?? '',
    status: p.status,
    doctorName: (p.users as { full_name?: string } | null)?.full_name ?? 'Doctor',
    createdAt: p.created_at,
  }))

  const labTests = (labTestsRes.data ?? []).map(t => ({
    id: t.id,
    testName: t.test_name,
    status: t.status,
    priority: t.priority,
    diagnosisReason: t.diagnosis_reason ?? '',
    labValues: t.lab_values ?? [],
    requestDate: t.request_date,
    initiatedBy: t.initiated_by ?? 'doctor',
    doctorName: (t.doctor as { full_name?: string } | null)?.full_name ?? null,
    price: t.price ?? null,
  }))

  const vitals = (vitalsRes.data ?? []).map(v => ({
    id: v.id,
    date: v.date,
    heartRate: v.heart_rate,
    bloodPressure: { systolic: v.bp_systolic, diastolic: v.bp_diastolic },
    glucose: v.glucose,
    temperature: v.temperature,
  }))

  const prescriptions = (prescriptionsRes.data ?? []).map(p => ({
    id: p.id,
    medicines: p.medicines ?? [],
    notes: p.notes ?? '',
    issuedDate: p.issued_date,
    doctorName: (p.users as { full_name?: string } | null)?.full_name ?? 'Doctor',
  }))

  return NextResponse.json({ predictions, labTests, vitals, prescriptions, patientName })
}
