import { NextRequest, NextResponse } from 'next/server';

const ML_API = process.env.ML_API_URL ?? 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${ML_API}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { detail: 'ML server unreachable. Make sure the FastAPI server is running on port 8000.' },
      { status: 503 }
    );
  }
}

export async function GET() {
  try {
    const res = await fetch(`${ML_API}/health`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: 'unreachable' }, { status: 503 });
  }
}
