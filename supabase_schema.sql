-- ============================================================
-- Dhanvantari AI - Supabase Database Schema
-- ============================================================
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('doctor', 'patient');
CREATE TYPE gender_type AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE mood_type AS ENUM ('good', 'neutral', 'bad');
CREATE TYPE appointment_status AS ENUM ('Confirmed', 'Pending', 'Cancelled');
CREATE TYPE appointment_mode AS ENUM ('Online', 'Offline');
CREATE TYPE order_type AS ENUM ('medicine', 'pathology', 'consultation');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'collected', 'processing', 'completed');
CREATE TYPE slot_status AS ENUM ('available', 'limited', 'full', 'closed');
CREATE TYPE prediction_status AS ENUM ('Pending', 'Approved', 'Modified');
CREATE TYPE test_request_status AS ENUM ('Pending', 'In Progress', 'Completed');
CREATE TYPE test_priority AS ENUM ('Normal', 'High', 'Urgent');
CREATE TYPE lab_value_status AS ENUM ('Normal', 'Abnormal', 'Critical');
CREATE TYPE notification_type AS ENUM ('alert', 'appointment', 'system', 'result', 'prescription', 'general');
CREATE TYPE payment_method AS ENUM ('card', 'upi', 'netbanking', 'cod');
CREATE TYPE risk_level AS ENUM ('High', 'Medium', 'Low');

-- ============================================================
-- USERS (linked to Supabase Auth)
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE,                          -- Supabase auth.users.id
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'patient',
  password_hash TEXT,                           -- for email/password login (base64, demo only)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOCTORS
-- ============================================================

CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  specialization TEXT,
  qualifications TEXT[],
  license_number TEXT,
  experience_years INT,
  bio TEXT,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PATIENTS
-- ============================================================

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender gender_type,
  blood_group blood_group,

  -- Address
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,

  -- Medical Info
  height_cm NUMERIC(5,2),
  weight_kg NUMERIC(5,2),
  allergies TEXT[],
  chronic_conditions TEXT[],
  current_medications TEXT[],

  -- Emergency Contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,

  -- Insurance
  insurance_provider TEXT,
  insurance_number TEXT,
  policy_holder TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- APPOINTMENTS
-- ============================================================

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  patient_name TEXT,                            -- denormalized for quick display
  doctor_name TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  type TEXT NOT NULL,                           -- 'Consultation', 'Follow-up', etc.
  mode appointment_mode NOT NULL DEFAULT 'Offline',
  status appointment_status NOT NULL DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRESCRIPTIONS
-- ============================================================

CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  patient_name TEXT,
  patient_age INT,
  prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
  advice TEXT,
  forwarded_to_pharmacy BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE prescription_medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  dosage TEXT,
  duration TEXT
);

-- ============================================================
-- MEDICINE CATALOG
-- ============================================================

CREATE TABLE medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  manufacturer TEXT,
  description TEXT,
  rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
  reviews_count INT DEFAULT 0,
  in_stock BOOLEAN DEFAULT TRUE,
  requires_prescription BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE orders (
  id TEXT PRIMARY KEY,                          -- e.g. ORD12345678
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  type order_type NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  total NUMERIC(10,2) NOT NULL,
  order_date TIMESTAMPTZ DEFAULT NOW(),

  -- Medicine order fields
  delivery_address TEXT,
  tracking_id TEXT,
  estimated_delivery DATE,

  -- Pathology order fields
  collection_date DATE,
  collection_time TEXT,
  collection_address TEXT,

  -- Consultation order fields
  doctor_name TEXT,
  appointment_date DATE,
  appointment_time TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INT DEFAULT 1,
  price NUMERIC(10,2) NOT NULL
);

-- ============================================================
-- PATHOLOGY TESTS CATALOG
-- ============================================================

CREATE TABLE pathology_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('test', 'package')),
  price NUMERIC(10,2) NOT NULL,
  description TEXT,
  turnaround_hours INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PATHOLOGY BOOKINGS
-- ============================================================

CREATE TABLE pathology_bookings (
  id TEXT PRIMARY KEY,                          -- e.g. LAB87654321
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  total NUMERIC(10,2) NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',

  -- Address
  full_name TEXT,
  phone TEXT,
  email TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  preferred_date DATE,
  preferred_time TEXT,

  -- Payment
  payment_method payment_method,

  -- Scheduling
  booking_date TIMESTAMPTZ DEFAULT NOW(),
  sample_collection_date DATE,
  queue_position INT,
  estimated_time TEXT,
  is_waitlisted BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pathology_booking_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id TEXT REFERENCES pathology_bookings(id) ON DELETE CASCADE,
  test_id UUID REFERENCES pathology_tests(id),
  test_name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  quantity INT DEFAULT 1,
  type TEXT CHECK (type IN ('test', 'package'))
);

-- ============================================================
-- TIME SLOTS (for pathology scheduling)
-- ============================================================

CREATE TABLE time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_date DATE NOT NULL,
  slot_time TEXT NOT NULL,
  total_capacity INT NOT NULL DEFAULT 10,
  booked_count INT NOT NULL DEFAULT 0,
  waitlist_count INT NOT NULL DEFAULT 0,
  status slot_status NOT NULL DEFAULT 'available',
  UNIQUE (slot_date, slot_time)
);

-- ============================================================
-- AI DISEASE PREDICTIONS
-- ============================================================

CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  patient_name TEXT,
  disease TEXT NOT NULL,
  confidence NUMERIC(5,2) CHECK (confidence >= 0 AND confidence <= 100),
  symptoms TEXT[],
  explanation TEXT,
  method TEXT,
  status prediction_status NOT NULL DEFAULT 'Pending',
  reviewed_by UUID REFERENCES doctors(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LAB TEST REQUESTS
-- ============================================================

CREATE TABLE lab_test_requests (
  id TEXT PRIMARY KEY,                          -- e.g. TR-001
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  patient_name TEXT,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  doctor_name TEXT,
  test_name TEXT NOT NULL,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status test_request_status NOT NULL DEFAULT 'Pending',
  priority test_priority NOT NULL DEFAULT 'Normal',
  diagnosis_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lab_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_request_id TEXT REFERENCES lab_test_requests(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT,
  reference_range TEXT,
  status lab_value_status NOT NULL DEFAULT 'Normal'
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DIARY ENTRIES
-- ============================================================

CREATE TABLE diary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[],
  mood mood_type DEFAULT 'neutral',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PATIENT HEALTH METRICS
-- ============================================================

CREATE TABLE patient_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  heart_rate INT,
  bp_systolic INT,
  bp_diastolic INT,
  glucose NUMERIC(6,2),
  temperature NUMERIC(4,1)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pathology_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pathology_booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_test_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_metrics ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own record
CREATE POLICY "users_self" ON users
  FOR ALL USING (auth.uid() = auth_id);

-- Patients can access their own data
CREATE POLICY "patients_self" ON patients
  FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Doctors can read all patients
CREATE POLICY "doctors_read_patients" ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN doctors d ON d.user_id = u.id
      WHERE u.auth_id = auth.uid()
    )
  );

-- Appointments: patients see their own, doctors see all
CREATE POLICY "appointments_patient" ON appointments
  FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
  );

CREATE POLICY "appointments_doctor" ON appointments
  FOR ALL USING (
    doctor_id IN (SELECT id FROM doctors WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
  );

-- Notifications: users see only their own
CREATE POLICY "notifications_self" ON notifications
  FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Diary entries: users see only their own
CREATE POLICY "diary_self" ON diary_entries
  FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Medicines catalog is public read
CREATE POLICY "medicines_public_read" ON medicines
  FOR SELECT USING (TRUE);

-- Pathology tests catalog is public read
ALTER TABLE pathology_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pathology_tests_public_read" ON pathology_tests
  FOR SELECT USING (TRUE);

-- Time slots are public read
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "time_slots_public_read" ON time_slots
  FOR SELECT USING (TRUE);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_orders_patient ON orders(patient_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_predictions_patient ON predictions(patient_id);
CREATE INDEX idx_lab_requests_patient ON lab_test_requests(patient_id);
CREATE INDEX idx_lab_requests_doctor ON lab_test_requests(doctor_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_diary_user ON diary_entries(user_id);
CREATE INDEX idx_metrics_patient ON patient_metrics(patient_id);
CREATE INDEX idx_pathology_bookings_patient ON pathology_bookings(patient_id);
CREATE INDEX idx_time_slots_date ON time_slots(slot_date);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_medicines_updated_at BEFORE UPDATE ON medicines FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pathology_bookings_updated_at BEFORE UPDATE ON pathology_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_lab_requests_updated_at BEFORE UPDATE ON lab_test_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_diary_updated_at BEFORE UPDATE ON diary_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- SEED DATA
-- ============================================================

-- ============================================================
-- MEDICINES CATALOG
-- (from components/patient/MedicineStore.tsx)
-- ============================================================

INSERT INTO medicines (id, name, category, price, original_price, manufacturer, description, rating, reviews_count, in_stock, requires_prescription) VALUES
  (uuid_generate_v4(), 'Paracetamol 500mg',   'Pain Relief',    45,   60,   'PharmaCorp',  'Effective pain and fever relief',       4.5, 234, TRUE, FALSE),
  (uuid_generate_v4(), 'Amoxicillin 250mg',   'Antibiotics',   120,  NULL, 'MediLife',    'Broad-spectrum antibiotic',             4.8, 189, TRUE, TRUE),
  (uuid_generate_v4(), 'Vitamin D3 Tablets',  'Vitamins',      280,  350,  'HealthPlus',  'Essential vitamin supplement',          4.6, 456, TRUE, FALSE),
  (uuid_generate_v4(), 'Cetirizine 10mg',     'Allergy',        85,  NULL, 'AllerCare',   'Antihistamine for allergies',           4.4, 312, TRUE, FALSE),
  (uuid_generate_v4(), 'Omeprazole 20mg',     'Digestive',      95,  120,  'GastroMed',   'Reduces stomach acid',                  4.7, 278, TRUE, FALSE),
  (uuid_generate_v4(), 'Aspirin 75mg',        'Cardiovascular', 55,  NULL, 'CardioHealth', 'Blood thinner for heart health',       4.3, 198, TRUE, FALSE),
  (uuid_generate_v4(), 'Metformin 500mg',     'Diabetes',      150,  NULL, 'DiabeCare',   'Diabetes management',                   4.6, 423, TRUE, TRUE),
  (uuid_generate_v4(), 'Ibuprofen 400mg',     'Pain Relief',    65,   80,  'PainAway',    'Anti-inflammatory pain relief',         4.5, 567, TRUE, FALSE);

-- ============================================================
-- PATHOLOGY TESTS CATALOG
-- (from app/pathology/page.tsx — TESTS array)
-- ============================================================

INSERT INTO pathology_tests (id, name, type, price, description, turnaround_hours) VALUES
  (uuid_generate_v4(), 'Complete Blood Count (CBC)',    'test',    299,  'Measures different components of blood',      6),
  (uuid_generate_v4(), 'Lipid Profile',                 'test',    499,  'Cholesterol and triglycerides test',          12),
  (uuid_generate_v4(), 'Liver Function Test',           'test',    599,  'Evaluates liver health',                      24),
  (uuid_generate_v4(), 'Kidney Function Test',          'test',    549,  'Assesses kidney performance',                 24),
  (uuid_generate_v4(), 'Thyroid Profile (T3/T4/TSH)',   'test',    799,  'Complete thyroid function assessment',        24),
  (uuid_generate_v4(), 'Diabetes Screening (HbA1c)',    'test',    449,  '3-month average blood sugar',                  6),
  (uuid_generate_v4(), 'Vitamin D & B12 Panel',         'test',    899,  'Essential vitamin levels',                    48),
  (uuid_generate_v4(), 'COVID-19 RT-PCR',               'test',    699,  'COVID-19 detection test',                      8),
  (uuid_generate_v4(), 'Iron Studies',                  'test',    349,  'Iron levels and storage',                     12),
  (uuid_generate_v4(), 'Urine Routine Analysis',        'test',    199,  'Complete urine examination',                   4),
  (uuid_generate_v4(), 'Calcium & Phosphorus',          'test',    399,  'Bone health markers',                         12),
  (uuid_generate_v4(), 'Full Body Health Checkup',      'test',   1999,  'Comprehensive health screening',              48);

-- ============================================================
-- PATHOLOGY PACKAGES CATALOG
-- (from app/pathology/page.tsx — PACKAGES array)
-- ============================================================

INSERT INTO pathology_tests (id, name, type, price, description, turnaround_hours) VALUES
  (uuid_generate_v4(), 'Basic Wellness',    'package',  799,  'Essential health screening package',    48),
  (uuid_generate_v4(), 'Advanced Health',  'package', 1499,  'Comprehensive health assessment',        48),
  (uuid_generate_v4(), 'Complete Body',    'package', 2999,  'Full body diagnostic package',           48),
  (uuid_generate_v4(), 'Diabetes Care',    'package',  999,  'Diabetes monitoring package',            48);

-- ============================================================
-- HEALTH INSURANCE PLANS
-- (from app/health-policy/page.tsx)
-- New table for insurance plans
-- ============================================================

CREATE TABLE IF NOT EXISTS insurance_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price_per_year NUMERIC(10,2) NOT NULL,
  coverage_amount NUMERIC(12,2) NOT NULL,
  is_popular BOOLEAN DEFAULT FALSE,
  features TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE insurance_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insurance_plans_public_read" ON insurance_plans FOR SELECT USING (TRUE);

INSERT INTO insurance_plans (name, price_per_year, coverage_amount, is_popular, features) VALUES
  (
    'Basic Plan',
    5000,
    300000,
    FALSE,
    ARRAY[
      'Hospitalization coverage',
      'Pre & post hospitalization',
      'Daycare procedures',
      'Ambulance charges',
      'Annual health checkup'
    ]
  ),
  (
    'Premium Plan',
    12000,
    1000000,
    TRUE,
    ARRAY[
      'All Basic Plan benefits',
      'Maternity coverage',
      'Critical illness cover',
      'No room rent limit',
      'International coverage',
      'Wellness programs'
    ]
  ),
  (
    'Family Plan',
    18000,
    1500000,
    FALSE,
    ARRAY[
      'All Premium Plan benefits',
      'Covers 4 family members',
      'Newborn baby coverage',
      'Restoration benefit',
      'Home healthcare',
      'Mental health coverage'
    ]
  );

-- ============================================================
-- KNOWLEDGE CENTER ARTICLES
-- (from app/knowledge-center/page.tsx — ARTICLES array)
-- ============================================================

CREATE TABLE IF NOT EXISTS knowledge_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  tag TEXT,
  tag_color TEXT,
  read_mins INT,
  stars NUMERIC(2,1),
  description TEXT,
  url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "knowledge_articles_public_read" ON knowledge_articles FOR SELECT USING (TRUE);

INSERT INTO knowledge_articles (title, category, tag, tag_color, read_mins, stars, description, url, image_url) VALUES
  (
    'Understanding Type 2 Diabetes',
    'Endocrinology', 'Essential', '#0891b2', 5, 4.8,
    'Types, symptoms, lifestyle management, and the latest insulin research.',
    'https://www.diabetes.org/diabetes/type-2',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=480&q=80'
  ),
  (
    'Heart Health: A Complete Guide',
    'Cardiology', 'Popular', '#3b82f6', 4, 4.9,
    'Prevention, diet, exercise, and early warning signs of cardiovascular disease.',
    'https://www.heart.org/en/health-topics/heart-attack',
    'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=480&q=80'
  ),
  (
    'Mental Wellness in 2025',
    'Psychology', 'New', '#8b5cf6', 6, 4.7,
    'Evidence-based strategies: CBT, mindfulness, sleep hygiene, and digital detox.',
    'https://www.nimh.nih.gov/health/topics/mental-health-medications',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=480&q=80'
  ),
  (
    'Nutrition Science Decoded',
    'Nutrition', 'Guide', '#14b8a6', 7, 4.6,
    'Macronutrients, micronutrients, fasting, and personalised eating plans.',
    'https://www.healthline.com/nutrition',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=480&q=80'
  ),
  (
    'Exercise for Every Body',
    'Wellness', 'Popular', '#10b981', 5, 4.8,
    'Structured workout plans, recovery science, and injury prevention tips.',
    'https://www.mayoclinic.org/healthy-lifestyle/fitness/basics/fitness-basics/hlv-20049447',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=480&q=80'
  ),
  (
    'Sleep Disorders Explained',
    'Sleep Medicine', 'In-Depth', '#f59e0b', 6, 4.7,
    'Insomnia, sleep apnea, circadian rhythm — diagnosis and treatment options.',
    'https://www.sleepfoundation.org/sleep-disorders',
    'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=480&q=80'
  );

-- ============================================================
-- DOCTOR DASHBOARD SEED DATA
-- (from components/doctor/DoctorStateContext.tsx)
-- ============================================================

-- Seed doctor user + doctor record
INSERT INTO users (id, auth_id, email, full_name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', NULL, 'dr.michael.chen@dhanvantari.ai', 'Dr. Michael Chen', 'doctor');

INSERT INTO doctors (id, user_id, specialization, experience_years, available) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'General Medicine', 10, TRUE);

-- Seed patient users + patient records
INSERT INTO users (id, auth_id, email, full_name, role) VALUES
  ('00000000-0000-0000-0000-000000000002', NULL, 'emma.watson@example.com',   'Emma Watson',    'patient'),
  ('00000000-0000-0000-0000-000000000003', NULL, 'marcus.jenkins@example.com','Marcus Jenkins', 'patient'),
  ('00000000-0000-0000-0000-000000000004', NULL, 'sarah.connor@example.com',  'Sarah Connor',   'patient'),
  ('00000000-0000-0000-0000-000000000005', NULL, 'john.doe@example.com',      'John Doe',       'patient'),
  ('00000000-0000-0000-0000-000000000006', NULL, 'lisa.anderson@example.com', 'Lisa Anderson',  'patient'),
  ('00000000-0000-0000-0000-000000000007', NULL, 'eleanor.pena@example.com',  'Eleanor Pena',   'patient'),
  ('00000000-0000-0000-0000-000000000008', NULL, 'jerome.bell@example.com',   'Jerome Bell',    'patient'),
  ('00000000-0000-0000-0000-000000000009', NULL, 'courtney.henry@example.com','Courtney Henry', 'patient');

INSERT INTO patients (id, user_id, first_name, last_name) VALUES
  ('00000000-0000-0000-1000-000000000001', '00000000-0000-0000-0000-000000000002', 'Emma',     'Watson'),
  ('00000000-0000-0000-1000-000000000002', '00000000-0000-0000-0000-000000000003', 'Marcus',   'Jenkins'),
  ('00000000-0000-0000-1000-000000000003', '00000000-0000-0000-0000-000000000004', 'Sarah',    'Connor'),
  ('00000000-0000-0000-1000-000000000004', '00000000-0000-0000-0000-000000000005', 'John',     'Doe'),
  ('00000000-0000-0000-1000-000000000005', '00000000-0000-0000-0000-000000000006', 'Lisa',     'Anderson'),
  ('00000000-0000-0000-1000-000000000006', '00000000-0000-0000-0000-000000000007', 'Eleanor',  'Pena'),
  ('00000000-0000-0000-1000-000000000007', '00000000-0000-0000-0000-000000000008', 'Jerome',   'Bell'),
  ('00000000-0000-0000-1000-000000000008', '00000000-0000-0000-0000-000000000009', 'Courtney', 'Henry');

-- Appointments
INSERT INTO appointments (patient_id, doctor_id, patient_name, doctor_name, appointment_date, appointment_time, type, mode, status) VALUES
  ('00000000-0000-0000-1000-000000000006', '00000000-0000-0000-0000-000000000010', 'Eleanor Pena',   'Dr. Michael Chen', '2024-03-09', '10:30', 'Cardiology Follow-up', 'Online',  'Confirmed'),
  ('00000000-0000-0000-1000-000000000007', '00000000-0000-0000-0000-000000000010', 'Jerome Bell',    'Dr. Michael Chen', '2024-03-09', '11:15', 'Initial Consultation', 'Online',  'Confirmed'),
  ('00000000-0000-0000-1000-000000000008', '00000000-0000-0000-0000-000000000010', 'Courtney Henry', 'Dr. Michael Chen', '2024-03-09', '13:00', 'Post-Op Check',        'Offline', 'Confirmed');

-- AI Predictions
INSERT INTO predictions (patient_id, patient_name, disease, confidence, symptoms, explanation, method, status) VALUES
  (
    '00000000-0000-0000-1000-000000000004',
    'John Doe', 'Diabetes Type 2', 94,
    ARRAY['Fatigue', 'Increased thirst', 'Frequent urination', 'Blurred vision'],
    'Based on the symptoms and patient history, the AI model predicts Type 2 Diabetes with high confidence.',
    'Deep Residual Neural Network', 'Pending'
  ),
  (
    '00000000-0000-0000-1000-000000000001',
    'Emma Watson', 'Hypertension', 87,
    ARRAY['Headache', 'Dizziness'],
    'Model suggests moderate risk of Hypertension. Requires blood pressure monitoring.',
    'Deep Residual Neural Network', 'Pending'
  );

-- Lab Test Requests
INSERT INTO lab_test_requests (id, patient_id, patient_name, doctor_id, doctor_name, test_name, request_date, status, priority, diagnosis_reason) VALUES
  ('TR-001', '00000000-0000-0000-1000-000000000001', 'Emma Watson',   '00000000-0000-0000-0000-000000000010', 'Dr. Michael Chen', 'Comprehensive Metabolic Panel', '2024-03-08', 'Completed',   'High',   'Follow-up for diabetes screening'),
  ('TR-002', '00000000-0000-0000-1000-000000000002', 'Marcus Jenkins','00000000-0000-0000-0000-000000000010', 'Dr. Michael Chen', 'Lipid Profile',                 '2024-03-07', 'Completed',   'Normal', 'Cardiovascular risk assessment'),
  ('TR-003', '00000000-0000-0000-1000-000000000003', 'Sarah Connor',  '00000000-0000-0000-0000-000000000010', 'Dr. Michael Chen', 'Complete Blood Count',          '2024-03-09', 'In Progress', 'Urgent', 'Suspected anemia and infection screening');

-- Lab Values for TR-001
INSERT INTO lab_values (test_request_id, name, value, unit, reference_range, status) VALUES
  ('TR-001', 'Glucose',    '115', 'mg/dL', '70-100',  'Abnormal'),
  ('TR-001', 'Creatinine', '0.9', 'mg/dL', '0.7-1.3', 'Normal');

-- Lab Values for TR-002
INSERT INTO lab_values (test_request_id, name, value, unit, reference_range, status) VALUES
  ('TR-002', 'Total Cholesterol', '210', 'mg/dL', '<200', 'Abnormal'),
  ('TR-002', 'LDL Cholesterol',   '145', 'mg/dL', '<100', 'Abnormal');

-- Notifications (linked to doctor user)
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
  ('00000000-0000-0000-0000-000000000001', 'High Risk Alert',    'Patient Michael Brown requires immediate attention.',              'alert',       FALSE),
  ('00000000-0000-0000-0000-000000000001', 'New Appointment',    'Emma Wilson scheduled a Consultation.',                           'appointment', FALSE),
  ('00000000-0000-0000-0000-000000000001', 'Lab Result Ready',   'Results for Complete Blood Count (John Doe) are ready.',          'result',      TRUE);

-- Patient Health Metrics
INSERT INTO patient_metrics (patient_id, recorded_at, heart_rate, bp_systolic, bp_diastolic, glucose, temperature) VALUES
  ('00000000-0000-0000-1000-000000000001', '2024-03-09 00:00:00+00', 72, 118, 78,  95,  98.4),
  ('00000000-0000-0000-1000-000000000001', '2024-03-08 00:00:00+00', 75, 120, 80,  98,  98.6),
  ('00000000-0000-0000-1000-000000000002', '2024-03-09 00:00:00+00', 88, 145, 95, 130,  99.1),
  ('00000000-0000-0000-1000-000000000003', '2024-03-09 00:00:00+00', 68, 110, 70,  88,  98.0),
  ('00000000-0000-0000-1000-000000000004', '2024-03-09 00:00:00+00', 80, 130, 85, 110,  98.8);
