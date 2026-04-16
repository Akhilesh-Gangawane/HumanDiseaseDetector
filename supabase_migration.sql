-- ============================================================
-- Dhanvantari AI — Full Schema Migration (v2)
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. password_hash column
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- ============================================================
-- 2. DOCTOR–PATIENT RELATIONSHIP
-- ============================================================
CREATE TABLE IF NOT EXISTS doctor_patients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(doctor_id, patient_id)
);

-- ============================================================
-- 3. APPOINTMENTS
--    doctor_id is nullable — patient can book without knowing doctor UUID
--    doctor_name stores the display name patient selected
--    initiated_by: 'doctor' | 'patient'
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  doctor_name    TEXT,
  patient_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  patient_name   TEXT NOT NULL,
  date           DATE NOT NULL,
  time           TEXT NOT NULL,
  type           TEXT NOT NULL DEFAULT 'Consultation',
  mode           TEXT NOT NULL DEFAULT 'Offline' CHECK (mode IN ('Online', 'Offline')),
  status         TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Confirmed', 'Pending', 'Cancelled')),
  reason         TEXT,
  initiated_by   TEXT NOT NULL DEFAULT 'doctor' CHECK (initiated_by IN ('doctor', 'patient')),
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. AI PREDICTIONS
--    initiated_by: 'doctor' | 'patient'
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_predictions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  patient_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  patient_name  TEXT NOT NULL,
  disease       TEXT NOT NULL,
  confidence    INT NOT NULL,
  symptoms      TEXT[] NOT NULL DEFAULT '{}',
  explanation   TEXT,
  status        TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Modified')),
  initiated_by  TEXT NOT NULL DEFAULT 'doctor' CHECK (initiated_by IN ('doctor', 'patient')),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. LAB / PATHOLOGY TEST REQUESTS
--    initiated_by: 'doctor' | 'patient'
-- ============================================================
CREATE TABLE IF NOT EXISTS lab_tests (
  id               TEXT PRIMARY KEY,
  doctor_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  patient_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  patient_name     TEXT NOT NULL,
  test_name        TEXT NOT NULL,
  priority         TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Normal', 'High', 'Urgent')),
  status           TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
  diagnosis_reason TEXT,
  lab_values       JSONB DEFAULT '[]',
  request_date     DATE DEFAULT CURRENT_DATE,
  initiated_by     TEXT NOT NULL DEFAULT 'doctor' CHECK (initiated_by IN ('doctor', 'patient')),
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. PATIENT VITALS / METRICS
-- ============================================================
CREATE TABLE IF NOT EXISTS patient_vitals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  patient_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  date         DATE NOT NULL,
  heart_rate   INT,
  bp_systolic  INT,
  bp_diastolic INT,
  glucose      INT,
  temperature  NUMERIC(4,1),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. DOCTOR NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS doctor_notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('alert', 'appointment', 'system', 'result')),
  read       BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. PATIENT NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS patient_notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('alert', 'appointment', 'result', 'prescription', 'general')),
  read       BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 9. PRESCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS prescriptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  medicines    JSONB NOT NULL DEFAULT '[]',
  notes        TEXT,
  issued_date  DATE DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 10. DIARY ENTRIES (shared table for both doctor & patient)
-- ============================================================
CREATE TABLE IF NOT EXISTS diary_entries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('doctor', 'patient')),
  date       DATE NOT NULL,
  title      TEXT NOT NULL,
  content    TEXT,
  tags       TEXT[] DEFAULT '{}',
  mood       TEXT NOT NULL DEFAULT 'neutral' CHECK (mood IN ('good', 'neutral', 'bad')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 11. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients             ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors              ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_patients      ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_tests            ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_vitals       ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries        ENABLE ROW LEVEL SECURITY;

-- users: own row only
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- patients: own row only
DROP POLICY IF EXISTS "patients_select_own" ON patients;
DROP POLICY IF EXISTS "patients_update_own" ON patients;
CREATE POLICY "patients_select_own" ON patients FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth.uid()::text = id::text));
CREATE POLICY "patients_update_own" ON patients FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- All other tables use service role key via Next.js API routes (bypasses RLS).
-- No anon-key access needed.

-- ============================================================
-- 12. ALTER EXISTING TABLES (safe — adds missing columns)
-- ============================================================
ALTER TABLE appointments   ADD COLUMN IF NOT EXISTS meet_link    TEXT;
ALTER TABLE appointments   ADD COLUMN IF NOT EXISTS doctor_name  TEXT;

-- ============================================================
-- 13. CONSULTATION RECORDINGS
--     Doctor uploads/links recording after the call.
--     Patient can only access recordings where shared = true.
--     Doctor controls visibility — patient cannot access without approval.
-- ============================================================
CREATE TABLE IF NOT EXISTS consultation_recordings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  title          TEXT NOT NULL,
  recording_url  TEXT NOT NULL,
  duration_mins  INT,
  shared         BOOLEAN NOT NULL DEFAULT false,  -- doctor must explicitly share with patient
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE consultation_recordings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 14. ALTER EXISTING TABLES (safe — adds missing columns)
-- ============================================================
ALTER TABLE appointments   ADD COLUMN IF NOT EXISTS reason       TEXT;
ALTER TABLE appointments   ADD COLUMN IF NOT EXISTS initiated_by TEXT NOT NULL DEFAULT 'doctor' CHECK (initiated_by IN ('doctor', 'patient'));
ALTER TABLE ai_predictions ADD COLUMN IF NOT EXISTS initiated_by TEXT NOT NULL DEFAULT 'doctor' CHECK (initiated_by IN ('doctor', 'patient'));
ALTER TABLE lab_tests      ADD COLUMN IF NOT EXISTS initiated_by TEXT NOT NULL DEFAULT 'doctor' CHECK (initiated_by IN ('doctor', 'patient'));

-- Make doctor_id nullable in tables where patient can initiate
ALTER TABLE appointments   ALTER COLUMN doctor_id DROP NOT NULL;
ALTER TABLE ai_predictions ALTER COLUMN doctor_id DROP NOT NULL;
ALTER TABLE lab_tests      ALTER COLUMN doctor_id DROP NOT NULL;
ALTER TABLE patient_vitals ALTER COLUMN doctor_id DROP NOT NULL;
