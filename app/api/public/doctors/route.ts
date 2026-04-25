import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

/**
 * GET /api/public/doctors
 * Returns all registered doctors with their profile data.
 * Public endpoint â€” no auth required (only non-sensitive fields returned).
 */
export async function GET() {
  const { data: doctorUsers, error } = await supabaseServer
    .from('users')
    .select('id, full_name, avatar_url')
    .eq('role', 'doctor')
    .order('full_name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!doctorUsers || doctorUsers.length === 0)
    return NextResponse.json({ doctors: [] })

  const userIds = doctorUsers.map(u => u.id)

  const { data: doctorDetails } = await supabaseServer
    .from('doctors')
    .select('user_id, specialization, license_number, experience_years, qualifications')
    .in('user_id', userIds)

  const details = doctorDetails ?? []

  const doctors = doctorUsers.map(u => {
    const d = details.find(x => x.user_id === u.id)
    return {
      id: u.id,
      name: u.full_name ?? 'Doctor',
      avatarUrl: u.avatar_url ?? null,
      specialty: d?.specialization ?? 'General Physician',
      experience: d?.experience_years ? `${d.experience_years} yrs` : null,
      qualifications: d?.qualifications?.join(', ') ?? null,
      licenseNumber: d?.license_number ?? null,
    }
  })

  return NextResponse.json({ doctors })
}
