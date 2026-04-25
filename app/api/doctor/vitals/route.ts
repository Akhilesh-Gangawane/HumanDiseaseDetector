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

// GET /api/doctor/vitals
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctorId = await getDoctorId(session.user.email)
  if (!doctorId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseServer
    .from('patient_vitals')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const metrics = (data ?? []).map(v => ({
    id: v.id,
    patientId: v.patient_id,
    date: v.date,
    heartRate: v.heart_rate,
    bloodPressure: { systolic: v.bp_systolic, diastolic: v.bp_diastolic },
    glucose: v.glucose,
    temperature: v.temperature,
  }))

  return NextResponse.json({ metrics })
}

// POST /api/doctor/vitals â€” log new vitals
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctorId = await getDoctorId(session.user.email)
  if (!doctorId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { patientId, date, heartRate, bpSys, bpDia, glucose, temp } = body

  if (!patientId || !date)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const { data, error } = await supabaseServer
    .from('patient_vitals')
    .insert({
      doctor_id: doctorId,
      patient_id: patientId ?? null,
      date,
      heart_rate: heartRate || null,
      bp_systolic: bpSys || null,
      bp_diastolic: bpDia || null,
      glucose: glucose || null,
      temperature: temp || null,
    })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    metric: {
      id: data.id, patientId: data.patient_id, date: data.date,
      heartRate: data.heart_rate, bloodPressure: { systolic: data.bp_systolic, diastolic: data.bp_diastolic },
      glucose: data.glucose, temperature: data.temperature,
    }
  })
}
