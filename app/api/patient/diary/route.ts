import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseServer } from '@/lib/supabaseServer'

async function getUserRow(email: string) {
  const { data } = await supabaseServer
    .from('users').select('id, role').eq('email', email).single()
  return data
}

// GET /api/patient/diary â€” fetch diary entries for logged-in user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserRow(session.user.email)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data, error } = await supabaseServer
    .from('diary_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ entries: data ?? [] })
}

// POST /api/patient/diary â€” create a new diary entry
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserRow(session.user.email)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await req.json()
  const { date, title, content, tags, mood } = body

  if (!title || !date) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const { data, error } = await supabaseServer
    .from('diary_entries')
    .insert({
      user_id: user.id,
      role: user.role,
      date,
      title,
      content: content ?? '',
      tags: tags ?? [],
      mood: mood ?? 'neutral',
    })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ entry: data })
}

// PATCH /api/patient/diary â€” update an entry
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserRow(session.user.email)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await req.json()
  const { id, date, title, content, tags, mood } = body

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabaseServer
    .from('diary_entries')
    .update({ date, title, content, tags, mood, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

// DELETE /api/patient/diary â€” delete an entry
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserRow(session.user.email)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabaseServer
    .from('diary_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
