import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseServer } from '@/lib/supabaseServer'

async function getDoctorRow(email: string) {
  const { data } = await supabaseServer
    .from('users').select('id, role, full_name').eq('email', email).single()
  if (!data || data.role !== 'doctor') return null
  return data
}

// GET /api/doctor/prescriptions
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctor = await getDoctorRow(session.user.email)
  if (!doctor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseServer
    .from('prescriptions')
    .select('*')
    .eq('doctor_id', doctor.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ prescriptions: data ?? [] })
}

// POST /api/doctor/prescriptions â€” issue a prescription
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctor = await getDoctorRow(session.user.email)
  if (!doctor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { patientId, patientName, medicines, notes } = body

  if (!patientName || !medicines?.length)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const { data, error } = await supabaseServer
    .from('prescriptions')
    .insert({
      doctor_id: doctor.id,
      patient_id: patientId ?? null,
      patient_name: patientName,
      medicines,
      notes: notes ?? '',
    })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify patient
  if (patientId) {
    const medicineNames = medicines.map((m: { name: string }) => m.name).join(', ')
    await supabaseServer.from('patient_notifications').insert({
      patient_id: patientId,
      doctor_id: doctor.id,
      title: 'New Prescription Issued',
      message: `Dr. ${doctor.full_name ?? 'Your doctor'} has issued a prescription: ${medicineNames}.`,
      type: 'prescription',
    })
  }

  return NextResponse.json({ prescription: data })
}
