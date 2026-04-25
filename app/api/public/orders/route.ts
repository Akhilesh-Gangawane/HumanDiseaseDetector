import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseServer } from '@/lib/supabaseServer'

/**
 * GET /api/public/orders
 * Returns the logged-in patient's medicine orders, lab bookings, and appointments
 * combined into a unified orders list.
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userRow } = await supabaseServer
    .from('users').select('id, role').eq('email', session.user.email).single()

  if (!userRow || userRow.role !== 'patient')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Get the patient row (appointments use patients.id, not users.id)
  const { data: patientRow } = await supabaseServer
    .from('patients').select('id').eq('user_id', userRow.id).single()

  const patientId = patientRow?.id

  const [labRes, apptRes, medRes] = await Promise.all([
    // Lab bookings (patient self-booked via pathology page)
    patientId
      ? supabaseServer
          .from('pathology_bookings')
          .select('*, pathology_booking_items(*)')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [], error: null }),

    // Appointments
    patientId
      ? supabaseServer
          .from('appointments')
          .select('*')
          .eq('patient_id', patientId)
          .order('appointment_date', { ascending: false })
      : Promise.resolve({ data: [], error: null }),

    // Medicine orders (use users.id as patient_id)
    supabaseServer
      .from('medicine_orders')
      .select('*')
      .eq('patient_id', userRow.id)
      .order('created_at', { ascending: false }),
  ])

  const labOrders = (labRes.data ?? []).map((b: {
    id: string; created_at: string; status: string; total: number;
    preferred_date?: string; preferred_time?: string;
    pathology_booking_items?: { test_name: string; price: number }[];
  }) => ({
    id: b.id,
    type: 'pathology' as const,
    date: b.created_at,
    status: (b.status === 'completed' ? 'completed'
      : b.status === 'processing' ? 'processing'
      : b.status === 'confirmed' ? 'confirmed'
      : 'pending') as string,
    total: b.total ?? 0,
    items: (b.pathology_booking_items ?? []).map((i: { test_name: string; price: number }) => ({
      name: i.test_name,
      price: i.price,
    })),
    collectionDate: b.preferred_date ?? null,
    collectionTime: b.preferred_time ?? null,
  }))

  const apptOrders = (apptRes.data ?? []).map((a: {
    id: string; created_at?: string; appointment_date: string; appointment_time: string;
    status: string; type?: string; mode: string; doctor_name?: string; meet_link?: string;
  }) => ({
    id: a.id,
    type: 'consultation' as const,
    date: a.created_at ?? a.appointment_date,
    status: (a.status === 'Confirmed' ? 'confirmed'
      : a.status === 'Cancelled' ? 'cancelled'
      : 'pending') as string,
    total: 0,
    items: [{ name: `${a.type ?? 'Consultation'} â€” ${a.mode}`, price: 0 }],
    doctorName: a.doctor_name ?? 'Doctor',
    appointmentDate: a.appointment_date,
    appointmentTime: a.appointment_time,
    meetLink: a.meet_link ?? null,
  }))

  const medicineOrders = (medRes.data ?? []).map((o: {
    id: string; created_at: string; status: string; total: number;
    items: { name: string; quantity?: number; price: number }[];
    delivery_address?: string; payment_method?: string;
  }) => ({
    id: o.id,
    type: 'medicine' as const,
    date: o.created_at,
    status: (o.status === 'Delivered' ? 'delivered'
      : o.status === 'Shipped' ? 'shipped'
      : o.status === 'Confirmed' ? 'confirmed'
      : 'pending') as string,
    total: o.total ?? 0,
    items: (o.items ?? []) as { name: string; quantity?: number; price: number }[],
    deliveryAddress: o.delivery_address ?? null,
    paymentMethod: o.payment_method ?? null,
  }))

  const orders = [...labOrders, ...apptOrders, ...medicineOrders].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return NextResponse.json({ orders })
}
