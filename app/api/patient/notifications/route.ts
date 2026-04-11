import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseServer } from '@/lib/supabaseServer'

async function getPatientId(email: string) {
  const { data } = await supabaseServer
    .from('users').select('id, role').eq('email', email).single()
  if (!data || data.role !== 'patient') return null
  return data.id as string
}

// GET /api/patient/notifications
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const patientId = await getPatientId(session.user.email)
  if (!patientId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseServer
    .from('patient_notifications')
    .select('*')
    .eq('patient_id', patientId)
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

// PATCH /api/patient/notifications — mark read / mark all read / delete
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const patientId = await getPatientId(session.user.email)
  if (!patientId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()

  if (body.markAllRead) {
    await supabaseServer.from('patient_notifications').update({ read: true }).eq('patient_id', patientId)
    return NextResponse.json({ success: true })
  }

  if (body.clearAll) {
    await supabaseServer.from('patient_notifications').delete().eq('patient_id', patientId)
    return NextResponse.json({ success: true })
  }

  if (body.id && body.read !== undefined) {
    await supabaseServer.from('patient_notifications').update({ read: body.read }).eq('id', body.id).eq('patient_id', patientId)
    return NextResponse.json({ success: true })
  }

  if (body.id && body.delete) {
    await supabaseServer.from('patient_notifications').delete().eq('id', body.id).eq('patient_id', patientId)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid operation' }, { status: 400 })
}
