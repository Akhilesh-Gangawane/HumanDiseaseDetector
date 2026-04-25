/**
 * Google Calendar helper — creates events with a real Google Meet conference link.
 * Uses conferenceDataVersion=1 so Google auto-generates a Meet room.
 *
 * Requires the access_token from the user's Google OAuth session
 * (scope: https://www.googleapis.com/auth/calendar.events).
 */

export interface CalendarEventInput {
  summary: string
  description: string
  date: string        // 'YYYY-MM-DD'
  time: string        // 'HH:MM' (24h)
  durationMins?: number
  attendeeEmails?: string[]
  timeZone?: string
}

export interface CalendarEventResult {
  eventId: string
  eventLink: string
  meetLink: string | null
}

/**
 * Refreshes a Google OAuth access token using the stored refresh token.
 * Returns the new access token, or null if refresh fails.
 */
export async function refreshGoogleAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     process.env.AUTH_GOOGLE_ID!,
        client_secret: process.env.AUTH_GOOGLE_SECRET!,
        grant_type:    'refresh_token',
        refresh_token: refreshToken,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.access_token ?? null
  } catch {
    return null
  }
}

/**
 * Returns a valid access token for a user given their stored tokens.
 * Tries the access token first; if it fails with 401, refreshes it.
 * Returns null if no valid token can be obtained.
 */
export async function getValidAccessToken(
  accessToken: string | null,
  refreshToken: string | null,
): Promise<string | null> {
  if (!accessToken && !refreshToken) return null

  // If we have an access token, try it — if it fails refresh
  if (accessToken) {
    const probe = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary?fields=id',
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    if (probe.ok) return accessToken
  }

  // Access token missing or expired — try to refresh
  if (refreshToken) {
    return await refreshGoogleAccessToken(refreshToken)
  }

  return null
}

/**
 * Creates a Google Calendar event with a Google Meet conference room.
 * Returns the event link and the generated Meet link.
 */
export async function createCalendarEvent(
  accessToken: string,
  input: CalendarEventInput,
): Promise<CalendarEventResult> {
  const tz = input.timeZone ?? 'Asia/Kolkata'
  const durationMins = input.durationMins ?? 30

  // Build ISO start/end
  const startISO = `${input.date}T${input.time.padStart(5, '0')}:00`
  const [h, m] = input.time.split(':').map(Number)
  const endMinutes = h * 60 + m + durationMins
  const endH = Math.floor(endMinutes / 60) % 24
  const endM = endMinutes % 60
  const endISO = `${input.date}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`

  const event: Record<string, any> = {
    summary: input.summary,
    description: input.description,
    start: { dateTime: startISO, timeZone: tz },
    end:   { dateTime: endISO,   timeZone: tz },
    // Ask Google to generate a Meet conference room
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email',  minutes: 60 },
        { method: 'popup',  minutes: 15 },
      ],
    },
  }

  if (input.attendeeEmails && input.attendeeEmails.length > 0) {
    event.attendees = input.attendeeEmails.map(email => ({ email }))
  }

  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    },
  )

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message ?? 'Failed to create Google Calendar event')
  }

  const data = await res.json()

  // Extract the Meet link from conference data
  const meetLink: string | null =
    data.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri ?? null

  return {
    eventId:   data.id,
    eventLink: data.htmlLink,
    meetLink,
  }
}
