import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseServer } from '@/lib/supabaseServer'

// GET /api/messages?appointmentId=xxx  — fetch all messages for an appointment
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const appointmentId = req.nextUrl.searchParams.get('appointmentId')
  if (!appointmentId) return NextResponse.json({ error: 'appointmentId required' }, { status: 400 })

  // Verify the caller is part of this appointment
  const { data: user } = await supabaseServer
    .from('users').select('id, role').eq('email', session.user.email).single()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: apt } = await supabaseServer
    .from('appointments').select('doctor_id, patient_id').eq('id', appointmentId).single()
  if (!apt) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })

  // Resolve the caller's row id depending on role
  let isParticipant = false
  if (user.role === 'doctor') {
    const { data: dr } = await supabaseServer
      .from('doctors').select('id').eq('user_id', user.id).single()
    isParticipant = dr?.id === apt.doctor_id
  } else if (user.role === 'patient') {
    const { data: pt } = await supabaseServer
      .from('patients').select('id').eq('user_id', user.id).single()
    isParticipant = pt?.id === apt.patient_id
  }

  if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseServer
    .from('messages')
    .select('id, sender_id, sender_name, sender_role, content, created_at')
    .eq('appointment_id', appointmentId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ messages: data ?? [] })
}

// POST /api/messages  — send a message
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { appointmentId, content } = await req.json()
  if (!appointmentId || !content?.trim())
    return NextResponse.json({ error: 'appointmentId and content required' }, { status: 400 })

  const { data: user } = await supabaseServer
    .from('users').select('id, role, full_name').eq('email', session.user.email).single()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Verify participant
  const { data: apt } = await supabaseServer
    .from('appointments').select('doctor_id, patient_id').eq('id', appointmentId).single()
  if (!apt) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })

  let isParticipant = false
  if (user.role === 'doctor') {
    const { data: dr } = await supabaseServer
      .from('doctors').select('id').eq('user_id', user.id).single()
    isParticipant = dr?.id === apt.doctor_id
  } else if (user.role === 'patient') {
    const { data: pt } = await supabaseServer
      .from('patients').select('id').eq('user_id', user.id).single()
    isParticipant = pt?.id === apt.patient_id
  }

  if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseServer
    .from('messages')
    .insert({
      appointment_id: appointmentId,
      sender_id:      user.id,
      sender_name:    user.full_name ?? session.user.email,
      sender_role:    user.role,
      content:        content.trim(),
    })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ message: data })
}
