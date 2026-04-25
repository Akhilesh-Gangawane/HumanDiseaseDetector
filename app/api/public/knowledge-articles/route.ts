import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

/**
 * GET /api/public/knowledge-articles
 * Returns all knowledge center articles from the database.
 * Public â€” no auth required.
 */
export async function GET() {
  const { data, error } = await supabaseServer
    .from('knowledge_articles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ articles: data ?? [] })
}
