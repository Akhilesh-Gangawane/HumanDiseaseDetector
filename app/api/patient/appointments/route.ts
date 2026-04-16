import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseServer } from '@/lib/supabaseServer'
import { createCalendarEvent } from '@/lib/googleCalendar'

async function getPatientRow(email: string) {
  const { data } = await supabaseServer
    .from('users').select('id, role, full_name, email').eq('email', email).single()
  if (!data || data.role !== 'patient') return null
  return data
}

// GET /api/patient/appointments — fetch patient's own appointments
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const patient = await getPatientRow(session.user.email)
  if (!patient) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseServer
    .from('appointments')
    .select('*')
    .eq('patient_id', patient.id)
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const appointments = (data ?? []).map(a => ({
    id: a.id,
    doctorName: a.doctor_name ?? 'Doctor',
    date: a.date,
    time: a.time,
    type: a.type,
    mode: a.mode,
    status: a.status,
    reason: a.reason ?? '',
    initiatedBy: a.initiated_by,
    meetLink: a.meet_link ?? null,
    calendarEventId: a.calendar_event_id ?? null,
    calendarEventLink: a.calendar_event_link ?? null,
  }))

  return NextResponse.json({ appointments })
}

// POST /api/patient/appointments — patient books a consultation
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const patient = await getPatientRow(session.user.email)
  if (!patient) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { doctorName, doctorId, date, time, type, mode, reason } = body

  if (!date || !time) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  // Try to get doctor email for calendar invite
  let doctorEmail: string | null = null
  if (doctorId) {
    const { data: du } = await supabaseServer.from('users').select('email').eq('id', doctorId).single()
    doctorEmail = du?.email ?? null
  }

  // Create a Google Calendar event (patient-side) — status is Pending so no Meet link yet
  let calendarEventId: string | null = null
  let calendarEventLink: string | null = null

  const accessToken = (session as any).access_token
  if (accessToken && date && time) {
    try {
      const attendees = [patient.email, doctorEmail].filter(Boolean) as string[]
      const calResult = await createCalendarEvent(accessToken, {
        summary: `${type ?? 'Consultation'} Request — Dr. ${doctorName ?? 'Doctor'}`,
        description: `Appointment request submitted by ${patient.full_name ?? 'Patient'}.\nMode: ${mode ?? 'Online'}\nReason: ${reason ?? 'Not specified'}\n\nNote: This is a pending request. You will receive a confirmation once the doctor approves.`,
        date,
        time,
        durationMins: 30,
        attendeeEmails: attendees,
      })
      calendarEventId   = calResult.eventId
      calendarEventLink = calResult.eventLink
    } catch (calErr) {
      console.error('[calendar] Failed to create patient calendar event:', calErr)
    }
  }

  const { data, error } = await supabaseServer
    .from('appointments')
    .insert({
      doctor_id: doctorId ?? null,
      doctor_name: doctorName ?? null,
      patient_id: patient.id,
      patient_name: patient.full_name ?? session.user.email,
      date,
      time,
      type: type ?? 'Consultation',
      mode: mode ?? 'Online',
      status: 'Pending',
      reason: reason ?? '',
      meet_link: null,
      calendar_event_id: calendarEventId,
      calendar_event_link: calendarEventLink,
      initiated_by: 'patient',
    })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify the doctor
  if (doctorId) {
    await supabaseServer.from('doctor_notifications').insert({
      doctor_id: doctorId,
      title: 'New Appointment Request',
      message: `${patient.full_name ?? 'A patient'} has requested a ${type ?? 'Consultation'} on ${date} at ${time} (${mode ?? 'Online'}).${reason ? ` Reason: ${reason}` : ''}`,
      type: 'appointment',
    })
  }

  return NextResponse.json({
    appointment: data,
    calendarEventLink,
  })
}
