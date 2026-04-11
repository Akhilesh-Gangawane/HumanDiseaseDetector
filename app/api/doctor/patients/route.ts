import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseServer } from '@/lib/supabaseServer'

// GET /api/doctor/patients — fetch all patients assigned to the logged-in doctor
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userRow } = await supabaseServer
    .from('users').select('id, role').eq('email', session.user.email).single()

  if (!userRow || userRow.role !== 'doctor')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Get all patients linked to this doctor
  const { data: links } = await supabaseServer
    .from('doctor_patients')
    .select('patient_id')
    .eq('doctor_id', userRow.id)

  if (!links || links.length === 0) return NextResponse.json({ patients: [] })

  const patientIds = links.map(l => l.patient_id)

  const { data: patientUsers } = await supabaseServer
    .from('users')
    .select('id, full_name, avatar_url, email')
    .in('id', patientIds)

  const { data: patientDetails } = await supabaseServer
    .from('patients')
    .select('user_id, date_of_birth, gender, blood_group, chronic_conditions')
    .in('user_id', patientIds)

  const patients = (patientUsers ?? []).map((u, idx) => {
    const detail = patientDetails?.find(p => p.user_id === u.id)
    const dob = detail?.date_of_birth
    const age = dob ? Math.floor((Date.now() - new Date(dob).getTime()) / 3.156e10) : null
    return {
      id: idx + 1,
      userId: u.id,
      name: u.full_name ?? u.email,
      age: age ?? 0,
      avatar: u.full_name ?? '',
      gender: detail?.gender ?? '',
      blood_group: detail?.blood_group ?? '',
      chronic_conditions: detail?.chronic_conditions ?? [],
      // disease/symptoms/confidence/risk come from ai_predictions — fetched separately
      symptoms: '',
      disease: '',
      confidence: 0,
      risk: 'Low' as const,
    }
  })

  return NextResponse.json({ patients })
}
