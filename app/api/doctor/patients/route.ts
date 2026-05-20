import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseServer } from '@/lib/supabaseServer'

// GET /api/doctor/patients â€” fetch all patients assigned to the logged-in doctor
// Joins latest ai_prediction per patient for disease/confidence/risk display
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userRow } = await supabaseServer
    .from('users').select('id, role').eq('email', session.user.email).single()

  if (!userRow || userRow.role !== 'doctor')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: links } = await supabaseServer
    .from('doctor_patients').select('patient_id').eq('doctor_id', userRow.id)

  if (!links || links.length === 0) return NextResponse.json({ patients: [] })

  const patientIds = links.map(l => l.patient_id)

  const [usersRes, detailsRes, predictionsRes] = await Promise.all([
    supabaseServer.from('users').select('id, full_name, avatar_url, email').in('id', patientIds),
    supabaseServer.from('patients').select('user_id, date_of_birth, gender, blood_group, chronic_conditions').in('user_id', patientIds),
    // Latest prediction per patient (any source â€” doctor or patient-initiated)
    supabaseServer
      .from('ai_predictions')
      .select('patient_id, disease, confidence, symptoms, status')
      .in('patient_id', patientIds)
      .order('created_at', { ascending: false }),
  ])

  const patientUsers = usersRes.data ?? []
  const patientDetails = detailsRes.data ?? []
  const predictions = predictionsRes.data ?? []

  // Create Maps for O(1) lookups
  const detailsMap = new Map(patientDetails.map(d => [d.user_id, d]))
  const predictionsMap = new Map(predictions.map(p => [p.patient_id, p]))

  const patients = patientUsers.map((u, idx) => {
    const detail = detailsMap.get(u.id)
    const dob = detail?.date_of_birth
    const age = dob ? Math.floor((Date.now() - new Date(dob).getTime()) / 3.156e10) : 0

    // Latest prediction for this patient
    const latestPred = predictionsMap.get(u.id)
    const confidence = latestPred?.confidence ?? 0
    const risk: 'High' | 'Medium' | 'Low' =
      confidence >= 80 ? 'High' : confidence >= 50 ? 'Medium' : 'Low'

    return {
      id: idx + 1,
      userId: u.id,
      name: u.full_name ?? u.email,
      age: age,
      avatar: u.full_name ?? '',
      gender: detail?.gender ?? '',
      blood_group: detail?.blood_group ?? '',
      chronic_conditions: detail?.chronic_conditions ?? [],
      symptoms: (latestPred?.symptoms ?? []).join(', '),
      disease: latestPred?.disease ?? '',
      confidence,
      risk,
    }
  })

  return NextResponse.json({ patients })
}
