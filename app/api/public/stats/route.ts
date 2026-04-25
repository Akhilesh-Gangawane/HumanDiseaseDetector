import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

/**
 * GET /api/public/stats
 * Returns live platform statistics for the landing page.
 * Public â€” no auth required.
 */
export async function GET() {
  const [doctorsRes, patientsRes, labTestsRes, predictionsRes, medicinesRes] = await Promise.all([
    supabaseServer.from('users').select('id', { count: 'exact', head: true }).eq('role', 'doctor'),
    supabaseServer.from('users').select('id', { count: 'exact', head: true }).eq('role', 'patient'),
    supabaseServer.from('pathology_tests').select('id', { count: 'exact', head: true }),
    supabaseServer.from('predictions').select('id', { count: 'exact', head: true }),
    supabaseServer.from('medicines').select('id', { count: 'exact', head: true }),
  ])

  return NextResponse.json({
    doctors: doctorsRes.count ?? 0,
    patients: patientsRes.count ?? 0,
    labTests: labTestsRes.count ?? 0,
    predictions: predictionsRes.count ?? 0,
    medicines: medicinesRes.count ?? 0,
  })
}
