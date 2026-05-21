import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseServer } from '@/lib/supabaseServer'

const MAX_SIZE_BYTES = 500 * 1024 * 1024 // 500 MB
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
const BUCKET = 'recordings'

/**
 * POST /api/doctor/recordings/upload
 * Accepts multipart/form-data with a single "file" field.
 * Uploads the Google Meet / video recording to Supabase Storage "recordings" bucket
 * and returns the public URL to be saved with the recording entry.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify doctor role
  const { data: userRow } = await supabaseServer
    .from('users')
    .select('id, role')
    .eq('email', session.user.email)
    .single()

  if (!userRow || userRow.role !== 'doctor') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Allowed: MP4, WebM, MOV, AVI.' },
      { status: 400 },
    )
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'File too large. Maximum size is 500 MB.' },
      { status: 400 },
    )
  }

  // Unique path: recordings/<doctorId>/<timestamp>-<filename>
  const ext = file.name.split('.').pop() ?? 'mp4'
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filePath = `${userRow.id}/${timestamp}-${safeName}`

  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadErr } = await supabaseServer.storage
    .from(BUCKET)
    .upload(filePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadErr) {
    console.error('[recordings/upload] Upload error:', uploadErr)
    return NextResponse.json({ error: uploadErr.message }, { status: 500 })
  }

  const { data: urlData } = supabaseServer.storage
    .from(BUCKET)
    .getPublicUrl(filePath)

  return NextResponse.json({ url: urlData.publicUrl })
}
