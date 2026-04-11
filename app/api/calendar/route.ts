import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accessToken = (session as any).access_token;
  if (!accessToken) {
    return NextResponse.json({ error: 'No Google Calendar access. Please sign in again.' }, { status: 403 });
  }

  const body = await req.json();
  const { summary, description, startDateTime, endDateTime, meetLink } = body;

  const event: Record<string, any> = {
    summary,
    description,
    start: { dateTime: startDateTime, timeZone: 'Asia/Kolkata' },
    end: { dateTime: endDateTime, timeZone: 'Asia/Kolkata' },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
  };

  if (meetLink) {
    event.description = `${description}\n\nJoin via Google Meet: ${meetLink}`;
  }

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.error?.message || 'Failed to create event' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ eventLink: data.htmlLink, eventId: data.id });
}
