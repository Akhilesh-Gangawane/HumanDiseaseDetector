import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseServer } from '@/lib/supabaseServer'

async function getDoctorId(email: string) {
  const { data } = await supabaseServer
    .from('users').select('id, role').eq('email', email).single()
  if (!data || data.role !== 'doctor') return null
  return data.id as string
}

// GET /api/doctor/appointments
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctorId = await getDoctorId(session.user.email)
  if (!doctorId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseServer
    .from('appointments')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const appointments = (data ?? []).map(a => ({
    id: a.id,
    patientName: a.patient_name,
    date: a.date,
    time: a.time,
    type: a.type,
    mode: a.mode,
    status: a.status,
    avatar: a.patient_name.split(' ')[0],
  }))

  return NextResponse.json({ appointments })
}

// POST /api/doctor/appointments — create new appointment
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctorId = await getDoctorId(session.user.email)
  if (!doctorId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { patientName, patientId, date, time, type, mode } = body

  if (!patientName || !date || !time)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const { data, error } = await supabaseServer
    .from('appointments')
    .insert({
      doctor_id: doctorId,
      patient_id: patientId ?? null,
      patient_name: patientName,
      date,
      time,
      type,
      mode,
      status: 'Confirmed',
    })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify patient
  if (patientId) {
    const { data: doctorUser } = await supabaseServer
      .from('users').select('full_name').eq('id', doctorId).single()
    await supabaseServer.from('patient_notifications').insert({
      patient_id: patientId,
      doctor_id: doctorId,
      title: 'Appointment Confirmed',
      message: `Your appointment with Dr. ${doctorUser?.full_name ?? 'your doctor'} is confirmed for ${date} at ${time} (${mode}).`,
      type: 'appointment',
    })
  }

  return NextResponse.json({
    appointment: { id: data.id, patientName: data.patient_name, date: data.date, time: data.time, type: data.type, mode: data.mode, status: data.status, avatar: data.patient_name.split(' ')[0] }
  })
}

// PATCH /api/doctor/appointments — update status
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctorId = await getDoctorId(session.user.email)
  if (!doctorId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })

  const { data: existing } = await supabaseServer
    .from('appointments').select('patient_id, patient_name, date, time').eq('id', id).single()

  const { error } = await supabaseServer
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .eq('doctor_id', doctorId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify patient of status change
  if (existing?.patient_id) {
    await supabaseServer.from('patient_notifications').insert({
      patient_id: existing.patient_id,
      doctor_id: doctorId,
      title: `Appointment ${status}`,
      message: `Your appointment on ${existing.date} at ${existing.time} has been ${status.toLowerCase()}.`,
      type: 'appointment',
    })
  }

  return NextResponse.json({ success: true })
}
