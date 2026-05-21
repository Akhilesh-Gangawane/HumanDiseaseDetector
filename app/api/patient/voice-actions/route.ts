import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseServer } from '@/lib/supabaseServer'

/* ─────────────────────────────────────────────────────────────────────────────
   /api/patient/voice-actions
   POST — Parse a voice call transcript and execute real database actions:
     • Book doctor appointments  (appointments.patient_id → patients.id)
     • Book lab tests / pathology
     • Order medicines
   Returns a list of actions taken so the UI can show confirmation cards.
───────────────────────────────────────────────────────────────────────────── */

async function getPatientRow(email: string) {
  const { data: userRow } = await supabaseServer
    .from('users').select('id, role, full_name, email').eq('email', email).single()
  if (!userRow || userRow.role !== 'patient') return null

  // appointments.patient_id → patients(id), NOT users(id)
  const { data: patientRow } = await supabaseServer
    .from('patients').select('id').eq('user_id', userRow.id).single()

  return { ...userRow, patientRowId: patientRow?.id ?? null }
}

/* ── Date helpers ─────────────────────────────────────────────────────────── */

const MONTHS: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
  jan: '01', feb: '02', mar: '03', apr: '04',
  jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
}

function extractDate(text: string): string | null {
  const today = new Date()
  const lower = text.toLowerCase()

  if (/\btomorrow\b/.test(lower)) {
    const d = new Date(today); d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }
  if (/\bday after tomorrow\b/.test(lower)) {
    const d = new Date(today); d.setDate(d.getDate() + 2)
    return d.toISOString().split('T')[0]
  }
  const nextDay = lower.match(/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/)
  if (nextDay) {
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
    const target = days.indexOf(nextDay[1])
    const d = new Date(today)
    const diff = (target - d.getDay() + 7) % 7 || 7
    d.setDate(d.getDate() + diff)
    return d.toISOString().split('T')[0]
  }
  const thisDay = lower.match(/\bthis\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/)
  if (thisDay) {
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
    const target = days.indexOf(thisDay[1])
    const d = new Date(today)
    const diff = (target - d.getDay() + 7) % 7
    d.setDate(d.getDate() + (diff === 0 ? 7 : diff))
    return d.toISOString().split('T')[0]
  }
  const dm = lower.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/)
  if (dm) return `${today.getFullYear()}-${MONTHS[dm[2]]}-${dm[1].padStart(2,'0')}`
  const md = lower.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?\b/)
  if (md) return `${today.getFullYear()}-${MONTHS[md[1]]}-${md[2].padStart(2,'0')}`
  const iso = text.match(/\b(\d{4}-\d{2}-\d{2})\b/)
  if (iso) return iso[1]
  const slash = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/)
  if (slash) {
    const year = slash[3].length === 2 ? `20${slash[3]}` : slash[3]
    return `${year}-${slash[2].padStart(2,'0')}-${slash[1].padStart(2,'0')}`
  }
  const inDays = lower.match(/\bin\s+(\d+)\s+days?\b/)
  if (inDays) {
    const d = new Date(today); d.setDate(d.getDate() + parseInt(inDays[1]))
    return d.toISOString().split('T')[0]
  }
  return null
}

function extractTime(text: string): string | null {
  const lower = text.toLowerCase()
  const m = lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/)
  if (m) {
    let h = parseInt(m[1])
    const min = m[2] ? parseInt(m[2]) : 0
    if (m[3] === 'pm' && h !== 12) h += 12
    if (m[3] === 'am' && h === 12) h = 0
    return `${h.toString().padStart(2,'0')}:${min.toString().padStart(2,'0')}`
  }
  if (/\bmorning\b/.test(lower))   return '10:00'
  if (/\bafternoon\b/.test(lower)) return '14:00'
  if (/\bevening\b/.test(lower))   return '17:00'
  return null
}

/* ── Types ────────────────────────────────────────────────────────────────── */

interface DoctorRef {
  id: string       // doctors.id  — FK for appointments.doctor_id
  userId: string   // users.id    — FK for doctor_notifications.doctor_id
  name: string
  specialty: string
}

interface ParsedAction {
  type: 'appointment' | 'lab' | 'medicine'
  doctorName?: string
  doctorId?: string      // doctors.id
  doctorUserId?: string  // users.id  (for notifications)
  date?: string
  time?: string
  mode?: 'Online' | 'Offline'
  reason?: string
  tests?: string[]
  medicines?: string[]
}

interface ActionResult {
  type: 'appointment' | 'lab' | 'medicine'
  success: boolean
  message: string
  data?: Record<string, unknown>
}

/* ── Transcript parser ────────────────────────────────────────────────────── */

function parseTranscript(
  transcript: string,
  doctors: DoctorRef[],
  labTests: { name: string }[],
  medicines: { name: string }[],
): ParsedAction[] {
  const actions: ParsedAction[] = []
  const lower = transcript.toLowerCase()

  /* Appointment */
  const wantsAppt =
    /\b(book|schedule|make|set up|arrange|want|need|request)\b.{0,40}\b(appointment|consult|consultation|visit|checkup|check-up|see (a |the )?doctor)\b/i.test(transcript) ||
    /\b(appointment|consult|consultation)\b.{0,40}\b(book|schedule|want|need|please|tomorrow|next|monday|tuesday|wednesday|thursday|friday)\b/i.test(transcript)

  if (wantsAppt) {
    const date = extractDate(transcript)
    const time = extractTime(transcript)
    const mode: 'Online' | 'Offline' = /\b(online|video|virtual|tele)\b/i.test(transcript) ? 'Online' : 'Offline'

    let matched: DoctorRef | null = null
    for (const doc of doctors) {
      const parts = doc.name.toLowerCase().split(' ')
      if (parts.some(p => p.length > 2 && lower.includes(p))) { matched = doc; break }
      if (doc.specialty && lower.includes(doc.specialty.toLowerCase())) { matched = doc; break }
    }

    const reasonMatch = transcript.match(/\b(?:for|because|regarding|about|due to)\s+([^.!?,]{5,60})/i)

    actions.push({
      type: 'appointment',
      doctorName:   matched?.name,
      doctorId:     matched?.id,
      doctorUserId: matched?.userId,
      date:   date ?? undefined,
      time:   time ?? undefined,
      mode,
      reason: reasonMatch ? reasonMatch[1].trim() : undefined,
    })
  }

  /* Lab tests */
  const wantsLab =
    /\b(book|schedule|want|need|order|get|do|run)\b.{0,40}\b(lab|test|blood|urine|pathology|sample|report|cbc|lft|kft|thyroid|sugar|glucose|cholesterol|x-ray|xray|mri|ultrasound|ecg|ekg)\b/i.test(transcript) ||
    /\b(lab test|blood test|urine test|pathology|health package|full body checkup)\b/i.test(transcript)

  if (wantsLab) {
    const matched: string[] = []
    for (const t of labTests) {
      const words = t.name.toLowerCase().split(/\s+/).filter(w => w.length > 3)
      if (words.some(w => lower.includes(w))) matched.push(t.name)
    }
    const keywords: Record<string, string> = {
      'cbc': 'Complete Blood Count (CBC)', 'complete blood count': 'Complete Blood Count (CBC)',
      'blood sugar': 'Blood Glucose (Fasting)', 'glucose': 'Blood Glucose (Fasting)',
      'thyroid': 'Thyroid Profile (T3, T4, TSH)',
      'cholesterol': 'Lipid Profile', 'lipid': 'Lipid Profile',
      'lft': 'Liver Function Test (LFT)', 'liver': 'Liver Function Test (LFT)',
      'kft': 'Kidney Function Test (KFT)', 'kidney': 'Kidney Function Test (KFT)',
      'urine': 'Urine Routine & Microscopy',
      'vitamin d': 'Vitamin D (25-OH)', 'vitamin b12': 'Vitamin B12',
      'hba1c': 'HbA1c (Glycated Hemoglobin)', 'diabetes': 'HbA1c (Glycated Hemoglobin)',
      'x-ray': 'Chest X-Ray', 'xray': 'Chest X-Ray',
      'ecg': 'ECG (Electrocardiogram)', 'ekg': 'ECG (Electrocardiogram)',
    }
    for (const [kw, name] of Object.entries(keywords)) {
      if (lower.includes(kw) && !matched.includes(name)) matched.push(name)
    }
    if (matched.length === 0) matched.push('Complete Blood Count (CBC)')
    actions.push({ type: 'lab', tests: matched })
  }

  /* Medicines */
  const wantsMed =
    /\b(order|buy|purchase|need|want|get|refill)\b.{0,40}\b(medicine|medication|tablet|capsule|drug|pill|syrup|injection|paracetamol|ibuprofen|amoxicillin|metformin|aspirin|omeprazole|cetirizine|azithromycin)\b/i.test(transcript) ||
    /\b(medicine|medication|tablet|capsule|drug|pill)\b.{0,40}\b(order|buy|purchase|need|want|please|deliver)\b/i.test(transcript)

  if (wantsMed) {
    const matched: string[] = []
    for (const m of medicines) {
      const words = m.name.toLowerCase().split(/\s+/).filter(w => w.length > 4)
      if (words.some(w => lower.includes(w)) || lower.includes(m.name.toLowerCase())) matched.push(m.name)
    }
    const common = ['paracetamol','ibuprofen','amoxicillin','metformin','aspirin','omeprazole','cetirizine','azithromycin','pantoprazole','atorvastatin']
    for (const med of common) {
      if (lower.includes(med) && !matched.some(m => m.toLowerCase().includes(med)))
        matched.push(med.charAt(0).toUpperCase() + med.slice(1) + ' 500mg')
    }
    if (matched.length === 0) {
      const nm = transcript.match(/\b(?:order|buy|need|want|get)\s+(?:some\s+)?([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(?:tablet|capsule|medicine|medication|pill|syrup)\b/i)
      if (nm) matched.push(nm[1])
    }
    if (matched.length > 0) actions.push({ type: 'medicine', medicines: matched })
  }

  return actions
}

/* ── Executors ────────────────────────────────────────────────────────────── */

type PatientCtx = { id: string; patientRowId: string | null; full_name: string | null; email: string }

async function executeAppointment(action: ParsedAction, patient: PatientCtx): Promise<ActionResult> {
  if (!patient.patientRowId)
    return { type: 'appointment', success: false, message: 'Patient profile not found. Please complete your profile.' }

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const date = action.date ?? tomorrow.toISOString().split('T')[0]
  const time = action.time ?? '10:00'

  const { data, error } = await supabaseServer
    .from('appointments')
    .insert({
      doctor_id:        action.doctorId ?? null,   // doctors.id
      doctor_name:      action.doctorName ?? 'To be assigned',
      patient_id:       patient.patientRowId,       // patients.id  ← correct FK
      patient_name:     patient.full_name ?? patient.email,
      appointment_date: date,
      appointment_time: time,
      type:             'Consultation',
      mode:             action.mode ?? 'Offline',
      status:           'Pending',
      reason:           action.reason ?? 'Booked via Voice Receptionist',
      initiated_by:     'patient',
    })
    .select().single()

  if (error) return { type: 'appointment', success: false, message: error.message }

  // Notify doctor — doctor_notifications.doctor_id = users.id
  if (action.doctorUserId) {
    await supabaseServer.from('doctor_notifications').insert({
      doctor_id: action.doctorUserId,
      title: '📅 New Appointment Request (Voice)',
      message: `${patient.full_name ?? 'A patient'} booked a ${action.mode ?? 'Offline'} consultation via Voice Receptionist on ${date} at ${time}.${action.reason ? ` Reason: ${action.reason}` : ''}`,
      type: 'appointment',
    })
  }

  // Notify patient — patient_notifications.patient_id = users.id
  await supabaseServer.from('patient_notifications').insert({
    patient_id: patient.id,
    title: '✅ Appointment Booked',
    message: `Your appointment with ${action.doctorName ?? 'a doctor'} has been requested for ${date} at ${time} (${action.mode ?? 'Offline'}). Status: Pending confirmation.`,
    type: 'appointment',
  })

  return {
    type: 'appointment',
    success: true,
    message: `Appointment requested with ${action.doctorName ?? 'a doctor'} on ${date} at ${time}`,
    data: { appointmentId: data.id, date, time, doctorName: action.doctorName, mode: action.mode },
  }
}

async function executeLabBooking(action: ParsedAction, patient: PatientCtx): Promise<ActionResult> {
  const tests = (action.tests ?? []).map(name => ({ name, price: 0 }))
  if (tests.length === 0) return { type: 'lab', success: false, message: 'No tests identified' }

  const bookingId = `LAB-VOICE-${Date.now()}`

  const { error: bookingError } = await supabaseServer
    .from('pathology_bookings')
    .insert({
      id:         bookingId,
      patient_id: patient.patientRowId,   // patients.id
      total:      0,
      status:     'pending',
      full_name:  patient.full_name ?? patient.email,
    })

  if (bookingError) return { type: 'lab', success: false, message: bookingError.message }

  await supabaseServer.from('pathology_booking_items').insert(
    tests.map(t => ({ booking_id: bookingId, test_name: t.name, price: 0, type: 'test' }))
  )

  // Notify patient (users.id)
  await supabaseServer.from('patient_notifications').insert({
    patient_id: patient.id,
    title: '🧪 Lab Tests Booked',
    message: `Your lab tests have been booked via Voice Receptionist: ${tests.map(t => t.name).join(', ')}. Booking ID: ${bookingId}.`,
    type: 'result',
  })

  // Notify linked doctors (doctor_patients.patient_id = users.id)
  const { data: links } = await supabaseServer
    .from('doctor_patients')
    .select('doctor_id')
    .eq('patient_id', patient.id)

  if (links && links.length > 0) {
    await supabaseServer.from('doctor_notifications').insert(
      links.map((l: { doctor_id: string }) => ({
        doctor_id: l.doctor_id,
        title: '🧪 Patient Booked Lab Tests (Voice)',
        message: `${patient.full_name ?? 'A patient'} booked lab tests via Voice Receptionist: ${tests.map(t => t.name).join(', ')}.`,
        type: 'result',
      }))
    )
  }

  return {
    type: 'lab',
    success: true,
    message: `Lab tests booked: ${tests.map(t => t.name).join(', ')}`,
    data: { bookingId, tests: tests.map(t => t.name) },
  }
}

async function executeMedicineOrder(action: ParsedAction, patient: PatientCtx): Promise<ActionResult> {
  const meds = action.medicines ?? []
  if (meds.length === 0) return { type: 'medicine', success: false, message: 'No medicines identified' }

  const { data, error } = await supabaseServer
    .from('medicine_orders')
    .insert({
      patient_id:   patient.id,   // medicine_orders.patient_id = users.id
      items:        meds.map(name => ({ name, quantity: 1, price: 0 })),
      total:        0,
      status:       'pending',
    })
    .select().single()

  if (error) return { type: 'medicine', success: false, message: error.message }

  await supabaseServer.from('patient_notifications').insert({
    patient_id: patient.id,
    title: '💊 Medicine Order Placed',
    message: `Your medicine order has been placed via Voice Receptionist: ${meds.join(', ')}. Order ID: ${data.id}.`,
    type: 'general',
  })

  return {
    type: 'medicine',
    success: true,
    message: `Medicine order placed: ${meds.join(', ')}`,
    data: { orderId: data.id, medicines: meds },
  }
}

/* ── Route handler ────────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const patient = await getPatientRow(session.user.email)
  if (!patient) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { transcript } = (await req.json()) as { transcript: string }
  if (!transcript || transcript.trim().length < 10)
    return NextResponse.json({ actions: [] })

  // Fetch doctors with both doctors.id (FK) and users.id (for notifications)
  const [doctorsRes, labTestsRes, medicinesRes] = await Promise.all([
    supabaseServer
      .from('doctors')
      .select('id, user_id, users!inner(full_name)')
      .limit(100),
    supabaseServer.from('pathology_tests').select('name, price').eq('type', 'test').limit(100),
    supabaseServer.from('medicines').select('name, price').limit(200),
  ])

  const doctors: DoctorRef[] = (doctorsRes.data ?? []).map((d: any) => ({
    id:       d.id,                                  // doctors.id
    userId:   d.user_id,                             // users.id
    name:     (d.users as any)?.full_name ?? 'Doctor',
    specialty: '',
  }))
  const labTests  = (labTestsRes.data  ?? []).map((t: any) => ({ name: t.name as string }))
  const medicines = (medicinesRes.data ?? []).map((m: any) => ({ name: m.name as string }))

  const parsedActions = parseTranscript(transcript, doctors, labTests, medicines)
  if (parsedActions.length === 0) return NextResponse.json({ actions: [] })

  const results: ActionResult[] = []
  for (const action of parsedActions) {
    if (action.type === 'appointment') {
      results.push(await executeAppointment(action, patient))
    } else if (action.type === 'lab') {
      results.push(await executeLabBooking(action, patient))
    } else if (action.type === 'medicine') {
      results.push(await executeMedicineOrder(action, patient))
    }
  }

  return NextResponse.json({ actions: results })
}
