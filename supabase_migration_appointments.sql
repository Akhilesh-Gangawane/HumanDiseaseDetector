-- ============================================================
-- APPOINTMENTS TABLE MIGRATION
-- Run this in your Supabase SQL editor to add missing columns
-- ============================================================

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS reason          TEXT,
  ADD COLUMN IF NOT EXISTS meet_link       TEXT,
  ADD COLUMN IF NOT EXISTS initiated_by    TEXT DEFAULT 'doctor',
  ADD COLUMN IF NOT EXISTS calendar_event_id          TEXT,
  ADD COLUMN IF NOT EXISTS calendar_event_link        TEXT,
  ADD COLUMN IF NOT EXISTS doctor_calendar_event_id   TEXT,
  ADD COLUMN IF NOT EXISTS doctor_calendar_event_link TEXT,
  ADD COLUMN IF NOT EXISTS patient_calendar_event_id  TEXT,
  ADD COLUMN IF NOT EXISTS patient_calendar_event_link TEXT;
