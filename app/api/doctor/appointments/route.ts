import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseServer } from '@/lib/supabaseServer'
import { createCalendarEvent, getValidAccessToken } from '@/lib/googleCalendar'

async function getDoctorRow(email: string) {
  const { data } = await supabaseServer
    .from('users').select('id, role, full_name, email').eq('email', email).single()
  if (!data || data.role !== 'doctor') return null

  // appointments.doctor_id references doctors(id), not users(id)
  const { data: doctorRow } = await supabaseServer
    .from('doctors').select('id').eq('user_id', data.id).single()

  return { ...data, doctorRowId: doctorRow?.id ?? null }
}

// GET /api/doctor/appointments
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctor = await getDoctorRow(session.user.email)
  if (!doctor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseServer
    .from('appointments')
    .select('*')
    .eq('doctor_id', doctor.doctorRowId ?? doctor.id)
    .order('appointment_date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const appointments = (data ?? []).map((a: Record<string, unknown>) => ({
    id: a.id,
    patientName: a.patient_name,
    patientId: a.patient_id,
    date: a.appointment_date,
    time: a.appointment_time,
    type: a.type,
    mode: a.mode,
    status: a.status,
    reason: (a.reason as string) ?? '',
    initiatedBy: (a.initiated_by as string) ?? 'doctor',
    meetLink: (a.meet_link as string) ?? null,
    calendarEventId: (a.calendar_event_id as string) ?? null,
    calendarEventLink: (a.calendar_event_link as string) ?? null,
    avatar: (a.patient_name as string).split(' ')[0],
  }))

  return NextResponse.json({ appointments })
}

// POST /api/doctor/appointments — doctor creates appointment
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctor = await getDoctorRow(session.user.email)
  if (!doctor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { patientName, patientId, date, time, type, mode } = body

  if (!patientName || !date || !time)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  if (!doctor.doctorRowId)
    return NextResponse.json({ error: 'Doctor profile not found.' }, { status: 400 })

  let patientEmail: string | null = null
  let patientGoogleAccessToken: string | null = null
  let patientGoogleRefreshToken: string | null = null
  // patientId from the doctor UI is users.id — resolve to patients.id for the FK
  let patientRowId: string | null = null
  if (patientId) {
    const { data: pu } = await supabaseServer
      .from('users')
      .select('email, google_access_token, google_refresh_token')
      .eq('id', patientId)
      .single()
    patientEmail              = pu?.email              ?? null
    patientGoogleAccessToken  = pu?.google_access_token  ?? null
    patientGoogleRefreshToken = pu?.google_refresh_token ?? null

    // Resolve patients.id (FK) from users.id
    const { data: pr } = await supabaseServer
      .from('patients').select('id').eq('user_id', patientId).single()
    patientRowId = pr?.id ?? null
  }

  let meetLink: string | null = null
  let calendarEventId: string | null = null
  let calendarEventLink: string | null = null

  const doctorAccessToken = (session as any).access_token
  if (doctorAccessToken) {
    try {
      const attendees = [doctor.email, patientEmail].filter(Boolean) as string[]
      const calResult = await createCalendarEvent(doctorAccessToken, {
        summary: `${type ?? 'Consultation'} — ${patientName}`,
        description: `Medical appointment with Dr. ${doctor.full_name ?? 'Doctor'}.\nPatient: ${patientName}\nMode: ${mode ?? 'Offline'}`,
        date,
        time,
        durationMins: 30,
        attendeeEmails: attendees,
      })
      calendarEventId   = calResult.eventId
      calendarEventLink = calResult.eventLink
      if (mode === 'Online' && calResult.meetLink) {
        meetLink = calResult.meetLink
      }
    } catch (calErr) {
      console.error('[calendar] Failed to create doctor calendar event:', calErr)
    }
  }

  let patientCalendarEventId: string | null = null
  let patientCalendarEventLink: string | null = null

  const validPatientToken = await getValidAccessToken(patientGoogleAccessToken, patientGoogleRefreshToken)
  if (validPatientToken) {
    try {
      const attendees = [patientEmail, doctor.email].filter(Boolean) as string[]
      const calResult = await createCalendarEvent(validPatientToken, {
        summary: `${type ?? 'Consultation'} — Dr. ${doctor.full_name ?? 'Doctor'}`,
        description: `Confirmed appointment with Dr. ${doctor.full_name ?? 'Doctor'}.\nMode: ${mode ?? 'Offline'}${meetLink ? `\nJoin Meet: ${meetLink}` : ''}`,
        date,
        time,
        durationMins: 30,
        attendeeEmails: attendees,
      })
      patientCalendarEventId   = calResult.eventId
      patientCalendarEventLink = calResult.eventLink
      if (validPatientToken !== patientGoogleAccessToken && patientId) {
        await supabaseServer
          .from('users')
          .update({ google_access_token: validPatientToken })
          .eq('id', patientId)
      }
    } catch (calErr) {
      console.error('[calendar] Failed to create patient calendar event:', calErr)
    }
  }

  const { data, error } = await supabaseServer
    .from('appointments')
    .insert({
      doctor_id:    doctor.doctorRowId,
      patient_id:   patientRowId,          // patients.id  ← correct FK
      patient_name: patientName,
      appointment_date: date,
      appointment_time: time,
      type,
      mode,
      status: 'Confirmed',
      meet_link:                   meetLink,
      calendar_event_id:           calendarEventId,
      calendar_event_link:         calendarEventLink,
      patient_calendar_event_id:   patientCalendarEventId,
      patient_calendar_event_link: patientCalendarEventLink,
      initiated_by: 'doctor',
    })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify patient
  if (patientId) {
    const parts: string[] = [
      `Your ${mode} appointment with Dr. ${doctor.full_name ?? 'your doctor'} is confirmed for ${date} at ${time}.`,
    ]
    if (meetLink) parts.push(`Join Google Meet: ${meetLink}`)
    if (patientCalendarEventLink) parts.push(`Event added to your Google Calendar: ${patientCalendarEventLink}`)

    await supabaseServer.from('patient_notifications').insert({
      patient_id: patientId,
      doctor_id:  doctor.doctorRowId,
      title: 'Appointment Confirmed',
      message: parts.join(' '),
      type: 'appointment',
    })
  }

  return NextResponse.json({
    appointment: {
      id: data.id,
      patientName: data.patient_name,
      date: data.appointment_date,
      time: data.appointment_time,
      type: data.type,
      mode: data.mode,
      status: data.status,
      meetLink: data.meet_link ?? null,
      calendarEventId: data.calendar_event_id ?? null,
      calendarEventLink: data.calendar_event_link ?? null,
      patientCalendarEventLink: data.patient_calendar_event_link ?? null,
      avatar: data.patient_name.split(' ')[0],
    },
  })
}

// PATCH /api/doctor/appointments — confirm / cancel
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctor = await getDoctorRow(session.user.email)
  if (!doctor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })

  const { data: existing } = await supabaseServer
    .from('appointments')
    .select('patient_id, patient_name, appointment_date, appointment_time, mode, meet_link, calendar_event_id, calendar_event_link, patient_calendar_event_id, patient_calendar_event_link, type')
    .eq('id', id)
    .single()

  if (!existing) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })

  let meetLink = existing.meet_link
  let calendarEventId = existing.calendar_event_id
  let calendarEventLink = existing.calendar_event_link
  let patientCalendarEventId = existing.patient_calendar_event_id
  let patientCalendarEventLink = existing.patient_calendar_event_link
  let patientUserId: string | null = null  // users.id for notifications

  if (status === 'Confirmed') {
    let patientEmail: string | null = null
    let patientGoogleAccessToken: string | null = null
    let patientGoogleRefreshToken: string | null = null
    if (existing.patient_id) {
      // existing.patient_id is patients.id — resolve to users.id first
      const { data: pr } = await supabaseServer
        .from('patients').select('user_id').eq('id', existing.patient_id).single()
      patientUserId = pr?.user_id ?? null

      if (patientUserId) {
        const { data: pu } = await supabaseServer
          .from('users')
          .select('email, google_access_token, google_refresh_token')
          .eq('id', patientUserId)
          .single()
        patientEmail              = pu?.email              ?? null
        patientGoogleAccessToken  = pu?.google_access_token  ?? null
        patientGoogleRefreshToken = pu?.google_refresh_token ?? null
      }
    }

    const accessToken = (session as any).access_token

    if (!calendarEventId && accessToken) {
      try {
        const attendees = [doctor.email, patientEmail].filter(Boolean) as string[]
        const calResult = await createCalendarEvent(accessToken, {
          summary: `${existing.type ?? 'Consultation'} — ${existing.patient_name}`,
          description: `Medical appointment with Dr. ${doctor.full_name ?? 'Doctor'}.\nPatient: ${existing.patient_name}\nMode: ${existing.mode}`,
          date: existing.appointment_date,
          time: existing.appointment_time,
          durationMins: 30,
          attendeeEmails: attendees,
        })
        calendarEventId   = calResult.eventId
        calendarEventLink = calResult.eventLink
        if (existing.mode === 'Online' && calResult.meetLink) {
          meetLink = calResult.meetLink
        }
      } catch (calErr) {
        console.error('[calendar] Failed to create doctor event on confirm:', calErr)
      }
    }

    if (!patientCalendarEventId) {
      const validPatientToken = await getValidAccessToken(patientGoogleAccessToken, patientGoogleRefreshToken)
      if (validPatientToken) {
        try {
          const attendees = [patientEmail, doctor.email].filter(Boolean) as string[]
          const calResult = await createCalendarEvent(validPatientToken, {
            summary: `${existing.type ?? 'Consultation'} — Dr. ${doctor.full_name ?? 'Doctor'}`,
            description: `Confirmed appointment with Dr. ${doctor.full_name ?? 'Doctor'}.\nMode: ${existing.mode}${meetLink ? `\nJoin Meet: ${meetLink}` : ''}`,
            date: existing.appointment_date,
            time: existing.appointment_time,
            durationMins: 30,
            attendeeEmails: attendees,
          })
          patientCalendarEventId   = calResult.eventId
          patientCalendarEventLink = calResult.eventLink
          if (validPatientToken !== patientGoogleAccessToken && patientUserId) {
            await supabaseServer
              .from('users')
              .update({ google_access_token: validPatientToken })
              .eq('id', patientUserId)
          }
        } catch (calErr) {
          console.error('[calendar] Failed to create patient event on confirm:', calErr)
        }
      }
    }
  }

  const { error } = await supabaseServer
    .from('appointments')
    .update({
      status,
      meet_link:                   meetLink,
      calendar_event_id:           calendarEventId,
      calendar_event_link:         calendarEventLink,
      patient_calendar_event_id:   patientCalendarEventId,
      patient_calendar_event_link: patientCalendarEventLink,
    })
    .eq('id', id)
    .eq('doctor_id', doctor.doctorRowId ?? doctor.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify patient — patient_notifications.patient_id = users.id
  if (patientUserId || existing.patient_id) {
    // If we didn't resolve patientUserId yet (e.g. status=Cancelled), resolve now
    if (!patientUserId && existing.patient_id) {
      const { data: pr } = await supabaseServer
        .from('patients').select('user_id').eq('id', existing.patient_id).single()
      patientUserId = pr?.user_id ?? null
    }
    if (patientUserId) {
      const parts: string[] = [
        `Your appointment on ${existing.appointment_date} at ${existing.appointment_time} has been ${status.toLowerCase()}.`,
      ]
      if (status === 'Confirmed') {
        if (meetLink) parts.push(`Join Google Meet: ${meetLink}`)
        if (patientCalendarEventLink) parts.push(`Event added to your Google Calendar: ${patientCalendarEventLink}`)
      }
      await supabaseServer.from('patient_notifications').insert({
        patient_id: patientUserId,
        doctor_id:  doctor.doctorRowId,
        title: `Appointment ${status}`,
        message: parts.join(' '),
        type: 'appointment',
      })
    }
  }

  return NextResponse.json({ success: true, meetLink, calendarEventLink, patientCalendarEventLink })
}
