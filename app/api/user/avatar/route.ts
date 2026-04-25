import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseServer } from '@/lib/supabaseServer'

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const BUCKET = 'avatars'

/**
 * POST /api/user/avatar
 * Accepts multipart/form-data with a single "file" field.
 * Uploads to Supabase Storage "avatars" bucket and updates users.avatar_url.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse multipart form
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
      { status: 400 },
    )
  }

  // Validate size
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'File too large. Maximum size is 5 MB.' },
      { status: 400 },
    )
  }

  // Get user id
  const { data: userRow, error: userErr } = await supabaseServer
    .from('users')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (userErr || !userRow) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Build a unique file path: avatars/<userId>.<ext>
  const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
  const filePath = `${userRow.id}.${ext}`

  // Upload to Supabase Storage (upsert â€” replaces existing)
  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadErr } = await supabaseServer.storage
    .from(BUCKET)
    .upload(filePath, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadErr) {
    console.error('[avatar] Upload error:', uploadErr)
    return NextResponse.json({ error: uploadErr.message }, { status: 500 })
  }

  // Get the public URL
  const { data: urlData } = supabaseServer.storage
    .from(BUCKET)
    .getPublicUrl(filePath)

  const publicUrl = urlData.publicUrl

  // Persist to users table
  const { error: updateErr } = await supabaseServer
    .from('users')
    .update({ avatar_url: publicUrl })
    .eq('id', userRow.id)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  return NextResponse.json({ avatarUrl: publicUrl })
}
