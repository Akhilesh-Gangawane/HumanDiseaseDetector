# Dhanvantari AI — Project Overview

> An AI-powered, full-stack healthcare platform that unifies disease prediction, telemedicine, pathology, pharmacy, and patient management into a single seamless experience.

---

## What is Dhanvantari AI?

Dhanvantari AI is a comprehensive digital healthcare platform built for both **patients** and **doctors**. It combines a trained machine learning disease prediction engine with real-time video consultations, an online pharmacy, pathology lab booking, and a knowledge center — all under one roof.

The platform is designed around a core belief: quality healthcare should be accessible, intelligent, and immediate — regardless of location.

---

## The Problem It Solves

| Problem | How Dhanvantari AI Addresses It |
|---|---|
| Doctor shortage (1:1,457 ratio in India) | AI triage reduces unnecessary consultations |
| Fragmented health apps (Practo, 1mg, PharmEasy separately) | Single platform for all health needs |
| Delayed diagnosis in rural areas | Symptom-based AI prediction available 24/7 |
| No continuity between prediction and action | Integrated consult → prescribe → order → track flow |
| Doctors overwhelmed with routine queries | AI pre-screens and flags high-risk cases |

---

## Core Modules

### 1. AI Disease Prediction Engine
- Symptom-based ML pipeline (Scikit-learn + graph features)
- 130+ searchable symptoms with autocomplete
- Outputs: disease name, confidence score (0–100%), risk level (Low / Medium / High)
- Voice input via Web Speech API
- 91%+ prediction accuracy on trained dataset

### 2. Doctor Dashboard
- Full appointment management (Online / Offline modes)
- AI Prediction Review — approve, modify, or flag predictions
- Patient management with vitals and history
- Prescription generator with PDF export
- Clinical Diary for personal case notes
- Reports & Analytics with trend charts
- Real-time notifications

### 3. Patient Dashboard
- Personalised health overview
- Quick access to all services
- Orders & Bookings tracker (medicines, tests, consultations)
- Health Diary with mood tracking and tags
- Notification centre

### 4. Video Consultation (VideoSDK)
- Real-time WebRTC video calls between doctor and patient
- Mic / camera toggle controls
- Room created on-demand via VideoSDK API
- Accessible from both doctor and patient dashboards

### 5. Pathology Lab Booking
- 200+ diagnostic tests and health packages
- 7-day calendar with hourly time slots
- Real-time slot availability and waitlist management
- Home sample collection scheduling
- 5-stage status tracking (Booking → Collection → Processing → Completed)

### 6. Medicine Store
- 10,000+ medicines with category filtering
- Shopping cart, promo codes, multi-step checkout
- Prescription upload for Rx-required medicines
- Order tracking with delivery status
- Digital invoice generation

### 7. Knowledge Center
- Curated health articles by specialty
- Trusted sources: Mayo Clinic, CDC, NHS, WebMD
- Search by disease, symptom, or treatment
- Trending health topics

### 8. Health Policy
- Insurance and health policy information
- Integrated into patient navigation

---

## User Roles

| Feature | Patient | Doctor |
|---|---|---|
| Disease Prediction | ✅ | ✅ |
| Video Consultation | ✅ Join | ✅ Host |
| Health Diary | ✅ | — |
| Clinical Diary | — | ✅ |
| AI Prediction Review | — | ✅ |
| Prescription Generator | — | ✅ |
| Patient Management | — | ✅ |
| Reports & Analytics | — | ✅ |
| Medicine Store | ✅ | — |
| Pathology Booking | ✅ | ✅ |
| Knowledge Center | ✅ | ✅ |
| Orders Dashboard | ✅ | — |

---

## Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | Framework, routing, SSR |
| React 18 + TypeScript | UI components, type safety |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations and transitions |
| Lenis | Smooth scroll |
| Three.js + React Three Fiber | 3D model rendering on login page |
| NextAuth.js v4 | Google OAuth authentication |
| VideoSDK React SDK | Real-time video consultations |

### Backend / ML
| Technology | Purpose |
|---|---|
| Python Flask | REST API for ML inference |
| Scikit-learn | ML pipeline and classification |
| XGBoost (GPU) | Gradient boosting model |
| Node2Vec | Graph-based symptom embeddings |
| Optuna | Hyperparameter tuning |
| Pandas / NumPy | Data processing |
| Joblib | Model serialisation |

### Planned Infrastructure
| Technology | Purpose |
|---|---|
| Prisma ORM | Type-safe database access |
| PostgreSQL (Neon) | Persistent data storage |
| Vercel | Frontend deployment |
| Railway / Render | Flask backend deployment |

---

## Project Structure

```
dhanvantari-ai/
├── app/                          # Next.js App Router pages
│   ├── api/auth/[...nextauth]/   # NextAuth Google OAuth
│   ├── dashboard/                # Doctor dashboard
│   ├── patient-dashboard/        # Patient dashboard + diary
│   ├── login/                    # Login / Register (3D models)
│   ├── consult-doctor/           # OPD + VideoSDK
│   ├── disease-prediction/       # AI prediction page
│   ├── pathology/                # Lab booking
│   ├── buy-medicine/             # Pharmacy
│   ├── knowledge-center/         # Health articles
│   └── health-policy/            # Insurance info
│
├── components/
│   ├── patient/                  # Patient-facing components
│   ├── doctor/                   # Doctor dashboard components
│   ├── landing/                  # Landing page sections
│   ├── ui/                       # Reusable UI primitives
│   ├── animations/               # Animation components
│   ├── VideoCall.tsx             # VideoSDK call component
│   ├── DiaryPage.tsx             # Shared diary (doctor + patient)
│   ├── DoctorModel3D.tsx         # 3D doctor model (login)
│   ├── PatientModel3D.tsx        # 3D patient model (login)
│   └── SessionWrapper.tsx        # NextAuth session provider
│
├── lib/
│   ├── videosdk.ts               # VideoSDK token + room creation
│   ├── data/dummyData.ts         # Mock data (pre-DB)
│   ├── types/index.ts            # Shared TypeScript types
│   └── symptoms.json             # 130+ symptom definitions
│
├── Model/                        # Python ML backend
│   ├── app.py                    # Flask API
│   ├── train_optuna.py           # Model training
│   ├── pipeline.py               # ML pipeline
│   ├── graph_features.py         # Node2Vec embeddings
│   ├── best_pipeline.joblib      # Trained model
│   └── requirements.txt
│
├── public/
│   ├── object_0.glb / .ply       # Doctor 3D model
│   ├── patients.glb / .ply       # Patient 3D model
│   ├── hero-images/              # 127-frame hero animation
│   ├── scroll-sequence/          # Scroll animation frames
│   └── herosection.mp4           # Landing hero video
│
├── .env.local                    # API keys (OAuth, VideoSDK)
├── methodology.md                # Detailed workflow methodology
├── methodology-slide.html        # Visual workflow slide
├── feasibility-viability.html    # Feasibility & viability report
└── overview.md                   # This file
```

---

## Key Metrics

| Metric | Value |
|---|---|
| ML Prediction Accuracy | 91%+ |
| Symptoms Supported | 130+ |
| Lab Tests Available | 200+ |
| Doctor Specialists | 6 specialties |
| Medicine Products | 10,000+ |
| Scroll Animation Frames | 127 (hero) + 145 × 4 (services) |
| Supported Devices | All — mobile-first responsive |

---

## Getting Started

### Frontend

```bash
npm install
npm run dev -- -p 4200
```

Open `http://localhost:4200`

### ML Backend

```bash
cd Model
pip install -r requirements.txt
python app.py
```

Flask API runs on `http://localhost:5000`

### Environment Variables (`.env.local`)

```env
NEXTAUTH_URL=http://localhost:4200
NEXTAUTH_SECRET=your-secret-key

AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

---

## Roadmap

- [x] AI disease prediction (ML pipeline)
- [x] Doctor & patient dashboards
- [x] Google OAuth authentication
- [x] VideoSDK real-time video consultations
- [x] 3D model login page
- [x] Health & Clinical Diary
- [x] Medicine store with checkout
- [x] Pathology booking with time slots
- [x] Knowledge center
- [ ] Prisma + PostgreSQL database integration
- [ ] Push notifications
- [ ] Progressive Web App (PWA)
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] ABDM / ABHA health ID integration

---

## Documentation

| File | Description |
|---|---|
| `overview.md` | This file — project summary |
| `FEATURES.md` | Detailed feature documentation |
| `methodology.md` | 7-stage AI workflow methodology |
| `methodology-slide.html` | Visual winding-road workflow slide |
| `feasibility-viability.html` | Feasibility & viability assessment |

---

*Dhanvantari AI — v2.1.0 — March 2026*
