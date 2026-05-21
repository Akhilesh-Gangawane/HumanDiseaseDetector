import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseServer } from '@/lib/supabaseServer'

// GET /api/user/profile â€” fetch the logged-in user's profile (users + patients or doctors)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userRow, error } = await supabaseServer
    .from('users')
    .select('id, full_name, email, avatar_url, role')
    .eq('email', session.user.email)
    .single()

  if (error || !userRow) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (userRow.role === 'patient') {
    const { data: patientRow } = await supabaseServer
      .from('patients')
      .select('*')
      .eq('user_id', userRow.id)
      .single()

    return NextResponse.json({
      user: userRow,
      patient: patientRow ?? null,
      // Flat convenience fields for realtime subscriptions
      userId:       userRow.id,
      patientRowId: patientRow?.id ?? null,
    })
  }

  if (userRow.role === 'doctor') {
    const { data: doctorRow } = await supabaseServer
      .from('doctors')
      .select('*')
      .eq('user_id', userRow.id)
      .single()

    return NextResponse.json({
      user: userRow,
      doctor: doctorRow ?? null,
      // Flat convenience fields for realtime subscriptions
      userId:      userRow.id,
      doctorRowId: doctorRow?.id ?? null,
    })
  }

  return NextResponse.json({ user: userRow })
}

// PUT /api/user/profile â€” update the logged-in user's profile
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const { data: userRow, error } = await supabaseServer
    .from('users')
    .select('id, role')
    .eq('email', session.user.email)
    .single()

  if (error || !userRow) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Update full_name in users table if provided
  if (body.full_name !== undefined) {
    await supabaseServer
      .from('users')
      .update({ full_name: body.full_name })
      .eq('id', userRow.id)
  }

  if (userRow.role === 'patient' && body.patient) {
    const p = body.patient
    await supabaseServer.from('patients').upsert({
      user_id: userRow.id,
      first_name: p.first_name ?? null,
      last_name: p.last_name ?? null,
      phone: p.phone ?? null,
      date_of_birth: p.date_of_birth ?? null,
      gender: p.gender ?? null,
      blood_group: p.blood_group ?? null,
      address: p.address ?? null,
      city: p.city ?? null,
      state: p.state ?? null,
      zip_code: p.zip_code ?? null,
      country: p.country ?? null,
      height_cm: p.height_cm ?? null,
      weight_kg: p.weight_kg ?? null,
      allergies: p.allergies ?? [],
      chronic_conditions: p.chronic_conditions ?? [],
      current_medications: p.current_medications ?? [],
      emergency_contact_name: p.emergency_contact_name ?? null,
      emergency_contact_phone: p.emergency_contact_phone ?? null,
      emergency_contact_relation: p.emergency_contact_relation ?? null,
      insurance_provider: p.insurance_provider ?? null,
      insurance_number: p.insurance_number ?? null,
      policy_holder: p.policy_holder ?? null,
    }, { onConflict: 'user_id' })
  }

  if (userRow.role === 'doctor' && body.doctor) {
    const d = body.doctor
    const qualifications = d.certifications
      ? d.certifications.split(',').map((s: string) => s.trim()).filter(Boolean)
      : []

    // Build the upsert payload â€” only include verification_status if explicitly passed
    const doctorPayload: Record<string, unknown> = {
      user_id:          userRow.id,
      specialization:   d.specialization   ?? null,
      license_number:   d.license_number   ?? null,
      experience_years: d.experience_years ?? null,
      qualifications:   qualifications.length ? qualifications : null,
      medical_council:  d.medical_council  ?? null,
      registration_year: d.registration_year ?? null,
      google_meet_link: d.google_meet_link ?? null,
      consultation_fee: d.consultation_fee ?? null,
      follow_up_fee:    d.follow_up_fee    ?? null,
    }

    // Only allow bumping to 'pending' from 'unverified' â€” never downgrade a verified doctor
    if (d.verification_status === 'pending') {
      doctorPayload.verification_status = 'pending'
    }

    await supabaseServer.from('doctors').upsert(doctorPayload, { onConflict: 'user_id' })
  }

  return NextResponse.json({ success: true })
}
