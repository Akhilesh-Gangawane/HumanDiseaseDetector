import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseServer } from '@/lib/supabaseServer'

async function getPatientRow(email: string) {
  const { data } = await supabaseServer
    .from('users').select('id, role, full_name').eq('email', email).single()
  if (!data || data.role !== 'patient') return null
  return data
}

// POST /api/patient/medicine-orders â€” save a medicine order
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const patient = await getPatientRow(session.user.email)
  if (!patient) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { items, total, address, paymentMethod } = body

  if (!items || items.length === 0)
    return NextResponse.json({ error: 'No items provided' }, { status: 400 })

  const { data, error } = await supabaseServer
    .from('medicine_orders')
    .insert({
      patient_id: patient.id,
      patient_name: patient.full_name ?? session.user.email,
      items,
      total,
      delivery_address: address ?? null,
      payment_method: paymentMethod ?? null,
      status: 'Confirmed',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ order: data })
}

// GET /api/patient/medicine-orders â€” fetch patient's medicine orders
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const patient = await getPatientRow(session.user.email)
  if (!patient) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseServer
    .from('medicine_orders')
    .select('*')
    .eq('patient_id', patient.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ orders: data ?? [] })
}
