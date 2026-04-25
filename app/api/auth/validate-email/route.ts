import { NextRequest, NextResponse } from 'next/server'
import dns from 'dns/promises'

// Basic RFC 5322-inspired regex â€” catches obvious garbage without being too strict
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ valid: false, reason: 'Email is required.' }, { status: 400 })
    }

    const trimmed = email.trim().toLowerCase()

    // 1. Format check
    if (!EMAIL_REGEX.test(trimmed)) {
      return NextResponse.json({ valid: false, reason: 'Invalid email format.' })
    }

    // 2. Extract domain
    const domain = trimmed.split('@')[1]

    // 3. MX record lookup â€” proves the domain can actually receive email
    try {
      const mxRecords = await dns.resolveMx(domain)
      if (!mxRecords || mxRecords.length === 0) {
        return NextResponse.json({ valid: false, reason: `The domain "${domain}" cannot receive emails.` })
      }
    } catch {
      // DNS lookup failed â€” domain doesn't exist or has no MX records
      return NextResponse.json({ valid: false, reason: `The domain "${domain}" does not appear to be a valid email domain.` })
    }

    return NextResponse.json({ valid: true })
  } catch {
    return NextResponse.json({ valid: false, reason: 'Could not validate email. Please try again.' }, { status: 500 })
  }
}
