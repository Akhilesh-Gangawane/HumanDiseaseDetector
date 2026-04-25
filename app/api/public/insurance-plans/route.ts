import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

/**
 * GET /api/public/insurance-plans
 * Returns all insurance plans from the database.
 * Public â€” no auth required.
 */
export async function GET() {
  const { data, error } = await supabaseServer
    .from('insurance_plans')
    .select('*')
    .order('price_per_year', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ plans: data ?? [] })
}
