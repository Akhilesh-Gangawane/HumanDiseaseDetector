import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client (uses service role key, bypasses RLS)
// Only use this in API routes / server components — never expose to browser
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
