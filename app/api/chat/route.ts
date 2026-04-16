import { NextRequest, NextResponse } from 'next/server'

const ML_API = process.env.ML_API_URL ?? 'http://localhost:8000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const res = await fetch(`${ML_API}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { message: 'AI backend is unreachable. Make sure the FastAPI server is running on port 8000.' },
      { status: 503 }
    )
  }
}
