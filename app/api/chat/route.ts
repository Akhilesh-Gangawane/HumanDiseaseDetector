import { NextRequest, NextResponse } from 'next/server'

// Use Python backend with RAG system instead of calling Ollama directly
const ML_API_URL = process.env.ML_API_URL ?? 'http://localhost:8000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, history = [], context } = body

    if (!message?.trim()) {
      return NextResponse.json({ message: 'Message is required' }, { status: 400 })
    }

    // Forward the request to Python backend's /chat endpoint with RAG
    const res = await fetch(`${ML_API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history,
        context,
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('[Python Backend] Error:', res.status, text)
      return NextResponse.json(
        { message: `AI backend returned an error (${res.status}). Make sure the Python server is running:\n  python app.py` },
        { status: 502 }
      )
    }

    const data = await res.json()
    const reply = data?.message

    if (!reply) {
      return NextResponse.json(
        { message: 'No response from AI backend. Please try again.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ message: reply })
  } catch (err: any) {
    console.error('[chat] Python backend unreachable:', err?.message)
    return NextResponse.json(
      { message: 'Cannot connect to AI backend. Make sure the Python server is running:\n  cd Human-Health_model\n  python app.py' },
      { status: 503 }
    )
  }
}
