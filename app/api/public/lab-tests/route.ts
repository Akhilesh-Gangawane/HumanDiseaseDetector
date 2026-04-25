import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

/**
 * GET /api/public/lab-tests
 * Returns all available lab tests and health packages from the catalogue.
 * Public â€” no auth required.
 */
export async function GET() {
  const [testsRes, packagesRes] = await Promise.all([
    supabaseServer
      .from('pathology_tests')
      .select('*')
      .eq('type', 'test')
      .order('name', { ascending: true }),
    supabaseServer
      .from('pathology_tests')
      .select('*')
      .eq('type', 'package')
      .order('name', { ascending: true }),
  ])

  return NextResponse.json({
    tests: testsRes.data ?? [],
    packages: packagesRes.data ?? [],
  })
}
