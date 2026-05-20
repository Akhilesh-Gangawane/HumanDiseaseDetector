import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: patientUserId } = params

  // 1 & 2. Verify doctor and get patient ID in parallel
  const [doctorRes, patientRowRes] = await Promise.all([
    supabaseServer.from('users').select('id, role').eq('email', session.user.email).single(),
    supabaseServer.from('patients').select('id').eq('user_id', patientUserId).single()
  ]);

  const userRow = doctorRes.data;
  if (!userRow || userRow.role !== 'doctor')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const patientTableId = patientRowRes.data?.id;

  // 3. Fetch all activities in parallel
  const [medRes, labRes, apptRes, predRes] = await Promise.all([
    // Medicine orders (patient_id is users.id)
    supabaseServer
      .from('medicine_orders')
      .select('*')
      .eq('patient_id', patientUserId)
      .order('created_at', { ascending: false }),

    // Pathology bookings (patient_id is patients.id)
    patientTableId 
      ? supabaseServer
          .from('pathology_bookings')
          .select('*, pathology_booking_items(*)')
          .eq('patient_id', patientTableId)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [], error: null }),

    // Appointments (patient_id is patients.id)
    patientTableId
      ? supabaseServer
          .from('appointments')
          .select('*')
          .eq('patient_id', patientTableId)
          .order('appointment_date', { ascending: false })
      : Promise.resolve({ data: [], error: null }),

    // AI Predictions (patient_id is users.id)
    supabaseServer
      .from('ai_predictions')
      .select('*')
      .eq('patient_id', patientUserId)
      .order('created_at', { ascending: false }),
  ])

  // 4. Normalize and combine
  const medicineOrders = (medRes.data ?? []).map(o => ({
    id: o.id,
    type: 'medicine',
    date: o.created_at,
    status: o.status,
    total: o.total,
    items: o.items,
    details: {
      address: o.delivery_address,
      payment: o.payment_method
    }
  }))

  const labBookings = (labRes.data ?? []).map(b => ({
    id: b.id,
    type: 'pathology',
    date: b.created_at,
    status: b.status,
    total: b.total,
    items: (b.pathology_booking_items ?? []).map((i: any) => ({ name: i.test_name, price: i.price })),
    details: {
      preferredDate: b.preferred_date,
      preferredTime: b.preferred_time,
      address: `${b.address_line1}, ${b.city}`
    }
  }))

  const appointments = (apptRes.data ?? []).map(a => ({
    id: a.id,
    type: 'appointment',
    date: a.appointment_date,
    status: a.status,
    title: a.type,
    details: {
      time: a.appointment_time,
      mode: a.mode,
      doctor: a.doctor_name,
      reason: a.reason
    }
  }))

  const predictions = (predRes.data ?? []).map(p => ({
    id: p.id,
    type: 'prediction',
    date: p.created_at,
    status: p.status,
    title: p.disease,
    details: {
      confidence: p.confidence,
      symptoms: p.symptoms,
      explanation: p.explanation,
      initiatedBy: p.initiated_by
    }
  }))

  const activities = [...medicineOrders, ...labBookings, ...appointments, ...predictions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return NextResponse.json({ activities })
}
