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

// GET /api/doctor/notifications
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctorId = await getDoctorId(session.user.email)
  if (!doctorId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseServer
    .from('doctor_notifications')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const notifications = (data ?? []).map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    read: n.read,
    time: new Date(n.created_at).toLocaleString(),
  }))

  return NextResponse.json({ notifications })
}

// POST /api/doctor/notifications â€” create notification
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctorId = await getDoctorId(session.user.email)
  if (!doctorId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, message, type } = await req.json()
  if (!title || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data, error } = await supabaseServer
    .from('doctor_notifications')
    .insert({ doctor_id: doctorId, title, message, type: type ?? 'system' })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}

// PATCH /api/doctor/notifications â€” mark read / mark all read / delete
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doctorId = await getDoctorId(session.user.email)
  if (!doctorId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()

  if (body.markAllRead) {
    await supabaseServer.from('doctor_notifications').update({ read: true }).eq('doctor_id', doctorId)
    return NextResponse.json({ success: true })
  }

  if (body.clearAll) {
    await supabaseServer.from('doctor_notifications').delete().eq('doctor_id', doctorId)
    return NextResponse.json({ success: true })
  }

  if (body.id && body.read !== undefined) {
    await supabaseServer.from('doctor_notifications').update({ read: body.read }).eq('id', body.id).eq('doctor_id', doctorId)
    return NextResponse.json({ success: true })
  }

  if (body.id && body.delete) {
    await supabaseServer.from('doctor_notifications').delete().eq('id', body.id).eq('doctor_id', doctorId)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid operation' }, { status: 400 })
}
