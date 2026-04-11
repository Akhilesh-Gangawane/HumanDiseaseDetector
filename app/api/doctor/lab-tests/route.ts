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

// GET /api/doctor/lab-tests
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctor = await getDoctorRow(session.user.email)
  if (!doctor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseServer
    .from('lab_tests')
    .select('*')
    .eq('doctor_id', doctor.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const tests = (data ?? []).map(t => ({
    id: t.id,
    patientId: t.patient_id,
    patientName: t.patient_name,
    testName: t.test_name,
    requestedByDoctorId: 1,
    requestedByDoctorName: doctor.full_name ?? 'Doctor',
    requestDate: t.request_date,
    status: t.status,
    priority: t.priority,
    diagnosisReason: t.diagnosis_reason ?? '',
    labValues: t.lab_values ?? [],
  }))

  return NextResponse.json({ tests })
}

// POST /api/doctor/lab-tests — create new test request
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctor = await getDoctorRow(session.user.email)
  if (!doctor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { patientId, patientName, testName, priority, reason } = body

  if (!patientName || !testName)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const id = `TR-${Math.floor(1000 + Math.random() * 9000)}`

  const { data, error } = await supabaseServer
    .from('lab_tests')
    .insert({
      id,
      doctor_id: doctor.id,
      patient_id: patientId ?? null,
      patient_name: patientName,
      test_name: testName,
      priority: priority ?? 'Normal',
      diagnosis_reason: reason ?? '',
      status: 'Pending',
      lab_values: [],
    })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify patient if patient_id is known
  if (patientId) {
    await supabaseServer.from('patient_notifications').insert({
      patient_id: patientId,
      doctor_id: doctor.id,
      title: 'Lab Test Requested',
      message: `Dr. ${doctor.full_name ?? 'Your doctor'} has requested a ${testName} test for you. Priority: ${priority ?? 'Normal'}.`,
      type: 'result',
    })
  }

  return NextResponse.json({
    test: {
      id: data.id, patientId: data.patient_id, patientName: data.patient_name,
      testName: data.test_name, requestedByDoctorId: 1, requestedByDoctorName: doctor.full_name ?? 'Doctor',
      requestDate: data.request_date, status: data.status, priority: data.priority,
      diagnosisReason: data.diagnosis_reason ?? '', labValues: [],
    }
  })
}

// PATCH /api/doctor/lab-tests — update status / add lab values
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctor = await getDoctorRow(session.user.email)
  if (!doctor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, status, labValues } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (status) updates.status = status
  if (labValues) updates.lab_values = labValues

  const { data: existing } = await supabaseServer
    .from('lab_tests').select('patient_id, test_name').eq('id', id).single()

  const { error } = await supabaseServer
    .from('lab_tests')
    .update(updates)
    .eq('id', id)
    .eq('doctor_id', doctor.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify patient when results are completed
  if (status === 'Completed' && existing?.patient_id) {
    await supabaseServer.from('patient_notifications').insert({
      patient_id: existing.patient_id,
      doctor_id: doctor.id,
      title: 'Lab Results Available',
      message: `Your ${existing.test_name} results are now available. Please check your health records.`,
      type: 'result',
    })
  }

  return NextResponse.json({ success: true })
}
