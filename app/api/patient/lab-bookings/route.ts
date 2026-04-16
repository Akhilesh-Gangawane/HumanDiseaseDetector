import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseServer } from '@/lib/supabaseServer'

async function getPatientRow(email: string) {
  const { data } = await supabaseServer
    .from('users').select('id, role, full_name').eq('email', email).single()
  if (!data || data.role !== 'patient') return null
  return data
}

// POST /api/patient/lab-bookings — patient books lab tests, creates entries visible to doctor
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const patient = await getPatientRow(session.user.email)
  if (!patient) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { tests } = body // array of { name, price }

  if (!tests || tests.length === 0)
    return NextResponse.json({ error: 'No tests provided' }, { status: 400 })

  const patientName = patient.full_name ?? session.user.email

  // Insert one lab_test row per test
  const rows = tests.map((t: { name: string }) => ({
    id: `PT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    doctor_id: null,
    patient_id: patient.id,
    patient_name: patientName,
    test_name: t.name,
    priority: 'Normal',
    status: 'Pending',
    diagnosis_reason: 'Patient self-booked',
    lab_values: [],
    initiated_by: 'patient',
  }))

  const { data, error } = await supabaseServer
    .from('lab_tests')
    .insert(rows)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify all assigned doctors
  const { data: links } = await supabaseServer
    .from('doctor_patients')
    .select('doctor_id')
    .eq('patient_id', patient.id)

  if (links && links.length > 0) {
    const testNames = tests.map((t: { name: string }) => t.name).join(', ')
    const notifications = links.map((l: { doctor_id: string }) => ({
      doctor_id: l.doctor_id,
      title: 'Patient Booked Lab Tests',
      message: `${patientName} has self-booked lab tests: ${testNames}. Please review when results are available.`,
      type: 'result' as const,
    }))
    await supabaseServer.from('doctor_notifications').insert(notifications)
  }

  return NextResponse.json({ tests: data })
}

// GET /api/patient/lab-bookings — fetch patient's own lab bookings
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const patient = await getPatientRow(session.user.email)
  if (!patient) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseServer
    .from('lab_tests')
    .select('*')
    .eq('patient_id', patient.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ tests: data ?? [] })
}
