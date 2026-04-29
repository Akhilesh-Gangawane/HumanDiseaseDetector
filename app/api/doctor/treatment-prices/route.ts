import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseServer } from '@/lib/supabaseServer'

// GET /api/doctor/treatment-prices - fetch treatment prices for a doctor
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const doctorId = searchParams.get('doctorId')

  if (!doctorId) {
    return NextResponse.json({ error: 'Doctor ID required' }, { status: 400 })
  }

  const { data: prices, error } = await supabaseServer
    .from('doctor_treatment_prices')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ prices })
}

// POST /api/doctor/treatment-prices - add a new treatment price
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the doctor's ID
  const { data: userRow } = await supabaseServer
    .from('users')
    .select('id, role')
    .eq('email', session.user.email)
    .single()

  if (!userRow || userRow.role !== 'doctor') {
    return NextResponse.json({ error: 'Only doctors can add treatment prices' }, { status: 403 })
  }

  const { data: doctorRow } = await supabaseServer
    .from('doctors')
    .select('id')
    .eq('user_id', userRow.id)
    .single()

  if (!doctorRow) {
    return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
  }

  const body = await req.json()

  const { data: price, error } = await supabaseServer
    .from('doctor_treatment_prices')
    .insert({
      doctor_id: doctorRow.id,
      treatment_name: body.treatment_name,
      treatment_category: body.treatment_category || null,
      price: parseFloat(body.price),
      duration_minutes: body.duration_minutes ? parseInt(body.duration_minutes) : null,
      description: body.description || null,
      is_active: body.is_active ?? true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ price })
}

// PUT /api/doctor/treatment-prices - update a treatment price
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: 'Treatment ID required' }, { status: 400 })
  }

  // Verify ownership
  const { data: userRow } = await supabaseServer
    .from('users')
    .select('id, role')
    .eq('email', session.user.email)
    .single()

  if (!userRow || userRow.role !== 'doctor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { data: doctorRow } = await supabaseServer
    .from('doctors')
    .select('id')
    .eq('user_id', userRow.id)
    .single()

  if (!doctorRow) {
    return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
  }

  const { data: price, error } = await supabaseServer
    .from('doctor_treatment_prices')
    .update(updates)
    .eq('id', id)
    .eq('doctor_id', doctorRow.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ price })
}

// DELETE /api/doctor/treatment-prices - delete a treatment price
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Treatment ID required' }, { status: 400 })
  }

  // Verify ownership
  const { data: userRow } = await supabaseServer
    .from('users')
    .select('id, role')
    .eq('email', session.user.email)
    .single()

  if (!userRow || userRow.role !== 'doctor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { data: doctorRow } = await supabaseServer
    .from('doctors')
    .select('id')
    .eq('user_id', userRow.id)
    .single()

  if (!doctorRow) {
    return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
  }

  const { error } = await supabaseServer
    .from('doctor_treatment_prices')
    .delete()
    .eq('id', id)
    .eq('doctor_id', doctorRow.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
