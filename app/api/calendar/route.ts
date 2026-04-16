import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '../auth/[...nextauth]/route'
import { createCalendarEvent } from '@/lib/googleCalendar'

/**
 * POST /api/calendar
 * Creates a Google Calendar event with a Google Meet conference link.
 *
 * Body:
 *   summary        string   — event title
 *   description    string   — event description
 *   date           string   — 'YYYY-MM-DD'
 *   time           string   — 'HH:MM' (24h)
 *   durationMins   number?  — default 30
 *   attendeeEmails string[] — optional list of attendee emails
 *
 * Returns:
 *   { eventLink, eventId, meetLink }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const accessToken = (session as any).access_token
  if (!accessToken) {
    return NextResponse.json(
      { error: 'No Google Calendar access. Please sign out and sign in again with Google.' },
      { status: 403 },
    )
  }

  const body = await req.json()
  const { summary, description, date, time, durationMins, attendeeEmails } = body

  if (!summary || !date || !time) {
    return NextResponse.json({ error: 'Missing required fields: summary, date, time' }, { status: 400 })
  }

  try {
    const result = await createCalendarEvent(accessToken, {
      summary,
      description: description ?? '',
      date,
      time,
      durationMins: durationMins ?? 30,
      attendeeEmails: attendeeEmails ?? [],
    })

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed to create event' }, { status: 500 })
  }
}
