import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

/**
 * GET /api/public/medicines
 * Returns all medicines from the catalogue.
 * Public â€” no auth required.
 */
export async function GET() {
  const { data, error } = await supabaseServer
    .from('medicines')
    .select('*')
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ medicines: data ?? [] })
}
