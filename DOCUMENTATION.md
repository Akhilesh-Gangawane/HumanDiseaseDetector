# Dhanvantari AI — Complete Project Documentation

> AI-powered healthcare monitoring and disease prediction platform built with Next.js 15 and FastAPI.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Architecture Diagram](#4-architecture-diagram)
5. [Frontend — Pages & Routes](#5-frontend--pages--routes)
6. [Frontend — Components](#6-frontend--components)
7. [Backend — API Routes](#7-backend--api-routes)
8. [ML Server (FastAPI)](#8-ml-server-fastapi)
9. [RAG — AI Chat Assistant](#9-rag--ai-chat-assistant)
10. [Authentication](#10-authentication)
11. [State Management](#11-state-management)
12. [Environment Variables](#12-environment-variables)
13. [Setup & Running Locally](#13-setup--running-locally)
14. [Data Flow Diagrams](#14-data-flow-diagrams)

---

## 1. Project Overview

**Dhanvantari AI** is a full-stack healthcare platform that connects patients and doctors through AI-assisted tools. It provides:

- AI disease prediction from symptoms (631 diseases, 400+ symptoms)
- RAG-powered medical chat assistant
- Doctor dashboard with patient management
- Medicine e-commerce store
- Pathology / lab test booking
- Telemedicine (consult a doctor)
- Health insurance policy browsing
- Medical knowledge center
- Patient health diary and order tracking

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.1.6 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3.4.1 |
| Auth | NextAuth v4 (Google OAuth) |
| 3D / WebGL | Three.js, @react-three/fiber, @react-three/drei |
| Animations | Framer Motion 11, Anime.js 4, Lenis (smooth scroll) |
| Charts | Recharts 3.8 |
| PDF Export | jsPDF + jsPDF-autotable |
| UI Feedback | SweetAlert2, Lucide React icons |
| Skeleton UI | Boneyard-js |
| ML Backend | FastAPI (Python) — separate server on port 8000 |
| AI Chat | RAG via FastAPI `/chat` endpoint |

---

## 3. Project Structure

```
dhanvantari-ai/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page (/)
│   ├── layout.tsx                # Root layout (providers, fonts)
│   ├── globals.css               # Global styles
│   ├── login/                    # /login — Google OAuth sign-in
│   ├── patient-dashboard/        # /patient-dashboard — patient hub
│   │   ├── diary/                # Health diary
│   │   ├── notifications/        # Notifications
│   │   ├── orders/               # Orders & bookings
│   │   ├── profile/              # Patient profile
│   │   └── settings/             # Account settings
│   ├── dashboard/                # /dashboard — doctor dashboard
│   ├── disease-prediction/       # /disease-prediction — AI symptom checker
│   ├── consult-doctor/           # /consult-doctor — telemedicine
│   ├── buy-medicine/             # /buy-medicine — medicine store
│   ├── pathology/                # /pathology — lab test booking
│   ├── health-policy/            # /health-policy — insurance plans
│   ├── knowledge-center/         # /knowledge-center — medical articles
│   └── api/
│       ├── predict/route.ts      # POST /api/predict — ML proxy
│       └── auth/[...nextauth]/   # NextAuth Google OAuth
│
├── components/
│   ├── landing/                  # Landing page sections
│   ├── patient/                  # Patient-facing components
│   ├── doctor/                   # Doctor dashboard components
│   ├── ui/                       # Shared UI primitives
│   └── animations/               # Animation components
│
├── lib/
│   └── symptomList.ts            # 400+ symptoms with API key mapping
│
├── bones/
│   └── registry.ts               # Boneyard skeleton registry
│
├── .env.local                    # Environment variables
├── package.json
└── tailwind.config.ts
```

---

## 4. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Landing     │  │  Patient     │  │  Doctor              │  │
│  │  Page (/)    │  │  Dashboard   │  │  Dashboard           │  │
│  └──────────────┘  └──────┬───────┘  └──────────┬───────────┘  │
│                           │                     │              │
│              ┌────────────▼─────────────────────▼──────────┐   │
│              │         Next.js App Router (SSR/CSR)         │   │
│              │                                              │   │
│              │  /disease-prediction  /consult-doctor        │   │
│              │  /buy-medicine        /pathology             │   │
│              │  /health-policy       /knowledge-center      │   │
│              └────────────────────────┬─────────────────────┘   │
└───────────────────────────────────────┼─────────────────────────┘
                                        │ HTTP
                    ┌───────────────────▼──────────────────────┐
                    │         Next.js API Routes (Edge)         │
                    │                                           │
                    │  POST /api/predict  ──────────────────┐  │
                    │  GET  /api/predict  (health check)    │  │
                    │  /api/auth/[...nextauth]  (OAuth)     │  │
                    └───────────────────────────────────────┼──┘
                                                            │ HTTP proxy
                    ┌───────────────────────────────────────▼──┐
                    │         FastAPI ML Server (port 8000)     │
                    │                                           │
                    │  POST /predict  — disease prediction      │
                    │  POST /chat     — RAG medical assistant   │
                    │  GET  /health   — health check            │
                    │                                           │
                    │  ┌─────────────────────────────────────┐ │
                    │  │  Apex Deep Residual Neural Network   │ │
                    │  │  631 diseases · 400+ symptoms        │ │
                    │  │  ~86.7% accuracy                     │ │
                    │  └─────────────────────────────────────┘ │
                    │                                           │
                    │  ┌─────────────────────────────────────┐ │
                    │  │  RAG Pipeline                        │ │
                    │  │  Vector DB + LLM + Medical Context   │ │
                    │  └─────────────────────────────────────┘ │
                    └───────────────────────────────────────────┘

                    ┌───────────────────────────────────────────┐
                    │         Google OAuth (NextAuth)            │
                    │  accounts.google.com                       │
                    └───────────────────────────────────────────┘
```

---

## 5. Frontend — Pages & Routes

### Landing Page `/`
The public-facing marketing page. Composed of:
- `Navbar` — sticky top nav with links
- `HeroVideo` — full-screen video hero section
- `FeaturesSection` — platform feature highlights
- `HowItWorks` — step-by-step guide
- `HealthScroll` — horizontal scroll health stats
- `AboutSection` — about the platform
- `ContactSection` — contact form
- `CTASection` — call-to-action
- `Footer` — site footer
- `AnimatedBackground` — neural-network canvas background
- `ScrollProgress` — reading progress bar

### Login `/login`
Google OAuth sign-in page powered by NextAuth. Redirects to `/patient-dashboard` on success.

### Patient Dashboard `/patient-dashboard`
Main hub for patients. Contains:
- `HeroSection` — welcome banner with user info
- `FeatureCards` — cards linking to all features
- `QuickAccessButtons` — shortcut buttons
- `ServicesSection` — service listings

Sub-routes:
| Route | Purpose |
|---|---|
| `/patient-dashboard/diary` | Personal health diary |
| `/patient-dashboard/notifications` | Alerts and updates |
| `/patient-dashboard/orders` | Medicine orders and lab bookings |
| `/patient-dashboard/profile` | Edit patient profile |
| `/patient-dashboard/settings` | Account preferences |

### Disease Prediction `/disease-prediction`
AI-powered symptom checker. Flow:
1. Patient selects symptoms from `SymptomSelector` (400+ options)
2. Submits to `POST /api/predict`
3. Displays predicted disease + confidence score
4. Opens `ChatAssistant` with prediction context for follow-up questions

### Consult Doctor `/consult-doctor`
Browse and book appointments with doctors. Supports online (Google Meet) and offline modes.

### Buy Medicine `/buy-medicine`
E-commerce store with 8+ medicines. Supports cart, checkout modals, and order placement.

### Pathology `/pathology`
Lab test booking system. Supports individual tests, packages, and home collection scheduling.

### Health Policy `/health-policy`
Browse health insurance plans and coverage details.

### Knowledge Center `/knowledge-center`
Medical articles and trusted health information resources.

### Doctor Dashboard `/dashboard`
Full-featured doctor workspace with 14 lazy-loaded tabs:

| Tab Key | Component | Purpose |
|---|---|---|
| `dashboard` | DashboardOverview | Stats, quick actions |
| `patients` | PatientManagement | Patient list and records |
| `ai-predictions` | AIPredictionReview | Review AI-generated predictions |
| `medicine-reviews` | MedicineReview | Approve/modify prescriptions |
| `consult-doctors` | ConsultDoctor | Peer consultations |
| `progress-tracker` | ProgressTracker | Patient progress charts |
| `prescriptions` | PrescriptionGenerator | Generate PDF prescriptions |
| `reports` | ReportsAnalytics | Analytics and reports |
| `lab-pathology` | LabPathology | Lab test requests and results |
| `appointments` | AppointmentsPage | Appointment calendar |
| `profile` | ProfilePage | Doctor profile |
| `settings` | SettingsPage | Dashboard settings |
| `notifications` | NotificationsPage | Alerts and messages |
| `diary` | DiaryPage | Doctor notes diary |

All tabs are loaded with `next/dynamic` for code splitting — only fetched when first opened.

---

## 6. Frontend — Components

### Landing Components (`components/landing/`)
| File | Description |
|---|---|
| `Navbar.tsx` | Top navigation with smooth scroll links |
| `HeroVideo.tsx` | Full-screen video hero with CTA |
| `FeaturesSection.tsx` | Feature grid with icons |
| `HowItWorks.tsx` | 3-step process illustration |
| `HealthScroll.tsx` | Animated horizontal health stats scroll |
| `AboutSection.tsx` | Platform mission and team |
| `ContactSection.tsx` | Contact form |
| `CTASection.tsx` | Final call-to-action banner |
| `Footer.tsx` | Site footer with links |

### Patient Components (`components/patient/`)
| File | Description |
|---|---|
| `PatientNavbar.tsx` | Patient-specific top navigation |
| `HeroSection.tsx` | Dashboard welcome banner |
| `FeatureCards.tsx` | Feature navigation cards |
| `QuickAccessButtons.tsx` | Shortcut action buttons |
| `ServicesSection.tsx` | Available services list |
| `ChatAssistant.tsx` | RAG-powered AI medical chat |
| `PredictionForm.tsx` | Symptom input form |
| `MedicineStore.tsx` | Medicine catalog and cart |
| `MedicineScroll.tsx` | Horizontal medicine scroll |
| `PathologyBookingSystem.tsx` | Lab test booking flow |
| `PathologyCheckout.tsx` | Pathology payment checkout |
| `PathologyScroll.tsx` | Lab test scroll browser |
| `OrderModals.tsx` | Order confirmation modals |
| `CheckoutModals.tsx` | Payment checkout modals |
| `OrdersBookings.tsx` | Order history view |
| `PatientProfile.tsx` | Profile edit form |
| `OpdScroll.tsx` | OPD services scroll |
| `KnowledgeScroll.tsx` | Knowledge center scroll |
| `HeroScroll.tsx` | Hero scroll animation |
| `Footer.tsx` | Patient section footer |

### Doctor Components (`components/doctor/`)
| File | Description |
|---|---|
| `DoctorNavbar.tsx` | Doctor dashboard top nav with tab switching |
| `DoctorHero.tsx` | Doctor dashboard hero banner |
| `DoctorFeatureCards.tsx` | Feature cards for doctor tools |
| `DashboardOverview.tsx` | Stats cards and quick actions |
| `PatientManagement.tsx` | Patient list, search, risk badges |
| `AIPredictionReview.tsx` | Review and approve AI predictions |
| `MedicineReview.tsx` | Prescription review and approval |
| `ConsultDoctor.tsx` | Peer consultation interface |
| `ProgressTracker.tsx` | Patient health metric charts |
| `PrescriptionGenerator.tsx` | PDF prescription builder |
| `ReportsAnalytics.tsx` | Recharts analytics dashboard |
| `LabPathology.tsx` | Lab test management |
| `AppointmentsPage.tsx` | Appointment calendar |
| `ProfilePage.tsx` | Doctor profile editor |
| `SettingsPage.tsx` | Dashboard settings |
| `NotificationsPage.tsx` | Notification center |
| `NotificationDropdown.tsx` | Navbar notification dropdown |
| `DoctorStateContext.tsx` | Global state context provider |
| `Sidebar.tsx` | Collapsible sidebar navigation |
| `StatCard.tsx` | Reusable stat display card |
| `ProgressBar.tsx` | Animated progress bar |
| `DashboardHeader.tsx` | Dashboard section header |

### UI Components (`components/ui/`)
| File | Description |
|---|---|
| `SymptomSelector.tsx` | Searchable symptom multi-select |
| `GlassCard.tsx` | Glassmorphism card container |
| `GradientButton.tsx` | Gradient CTA button |
| `NeuralNetworkBackground.tsx` | Animated neural network canvas |
| `NeuralNetworkContainer.tsx` | Wrapper with neural background |
| `AnimatedBackground.tsx` | Full-screen animated background |
| `BackgroundPattern.tsx` | Decorative background pattern |
| `BackgroundPatterns.tsx` | Multiple pattern variants |
| `FeatureBackgrounds.tsx` | Feature section backgrounds |
| `GalaxyStars.tsx` | Star particle background |
| `ScrollProgress.tsx` | Page scroll progress bar |
| `ThemeToggle.tsx` | Light/dark mode toggle |

### Animation Components
| File | Description |
|---|---|
| `animations/AIConfidence.tsx` | Animated confidence meter |
| `animations/CounterAnimation.tsx` | Number count-up animation |
| `animations/ECGLine.tsx` | Animated ECG heartbeat line |
| `animations/StaggerText.tsx` | Staggered text reveal |
| `CellularTransition.tsx` | Cell-based page transition |
| `HeartbeatTransition.tsx` | Heartbeat page transition |
| `LoadingTransition.tsx` | Global loading overlay |
| `PageTransition.tsx` | Route change transition |

### Shared Components
| File | Description |
|---|---|
| `SessionWrapper.tsx` | NextAuth `SessionProvider` wrapper |
| `LenisProvider.tsx` | Lenis smooth scroll provider |
| `DiaryPage.tsx` | Shared diary (patient + doctor roles) |
| `DoctorModel3D.tsx` | Three.js 3D doctor model |
| `PatientModel3D.tsx` | Three.js 3D patient model |
| `ScrollOverlayText.tsx` | Scroll-triggered overlay text |
| `Button.tsx` | Base button component |

---

## 7. Backend — API Routes

### `POST /api/predict`
Proxies symptom data to the FastAPI ML server. Acts as a secure server-side relay so the ML server is never exposed directly to the browser.

Request body:
```json
{
  "symptoms": {
    "itching": 1,
    "skin_rash": 1,
    "fatigue": 1
  }
}
```

Response:
```json
{
  "prediction": "Fungal infection",
  "confidence": 0.92,
  "method": "Deep Residual Neural Network"
}
```

Error (ML server down):
```json
{
  "detail": "ML server unreachable. Make sure the FastAPI server is running on port 8000."
}
```

### `GET /api/predict`
Health check — pings `GET /health` on the ML server and returns its status.

### `/api/auth/[...nextauth]`
Handles all NextAuth OAuth flows (GET + POST). Configured with Google provider. Custom sign-in page at `/login`.

---

## 8. ML Server (FastAPI)

The ML server is a **separate Python project** (`Human-Health_model/`) that must be started independently.

### Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/predict` | Predict disease from symptoms |
| POST | `/chat` | RAG medical chat response |
| GET | `/health` | Server health check |

### Starting the ML Server
```bash
cd Human-Health_model
python -m uvicorn app:app --port 8000
```

### Prediction Model
- Name: Apex Disease Prediction Network
- Architecture: Deep Residual Neural Network
- Diseases: 631
- Symptoms: 400+
- Accuracy: ~86.7%

### Symptom Key Format
Symptoms are sent as snake_case keys matching `lib/symptomList.ts`:
```json
{ "high_fever": 1, "headache": 1, "nausea": 1 }
```

The `lib/symptomList.ts` file maps display names to API keys:
```ts
{ display: "High Fever", key: "high_fever" }
```

---

## 9. RAG — AI Chat Assistant

The `ChatAssistant` component (`components/patient/ChatAssistant.tsx`) is a RAG-powered medical assistant.

### How It Works

```
User types message
        │
        ▼
Build message history (last 8 messages)
        │
        ▼
Attach prediction context (disease, confidence, symptoms)
        │
        ▼
POST http://localhost:8000/chat
{
  "message": "What should I eat?",
  "history": [...],
  "context": {
    "disease": "Diabetes",
    "confidence": 88,
    "symptoms": ["polyuria", "fatigue", "weight_loss"]
  }
}
        │
        ▼
FastAPI RAG Pipeline
  → Retrieves relevant medical documents from vector DB
  → Augments LLM prompt with retrieved context
  → Returns grounded medical response
        │
        ▼
Display AI response in chat UI
```

### Features
- Context-aware: automatically receives disease prediction results
- Voice input: Web Speech API (Chrome/Edge)
- Message history: last 8 messages sent for conversational context
- Graceful fallback: if backend is unreachable, shows context-based static message
- Typing indicator while waiting for response

### Integration with Disease Prediction
After a prediction is made on `/disease-prediction`, the result is passed as `ChatContext` to `ChatAssistant`:
```ts
interface ChatContext {
  symptoms: string[];
  disease: string;
  confidence: number;
}
```
The assistant's welcome message and all subsequent responses are grounded in this context.

---

## 10. Authentication

Authentication is handled by **NextAuth v4** with Google OAuth.

### Flow

```
User clicks "Sign in with Google"
        │
        ▼
/login page → NextAuth initiates OAuth
        │
        ▼
Google OAuth consent screen
        │
        ▼
Callback → NextAuth creates session
        │
        ▼
SessionWrapper (SessionProvider) makes session
available via useSession() throughout the app
        │
        ▼
Redirect to /patient-dashboard
```

### Configuration (`app/api/auth/[...nextauth]/route.ts`)
```ts
NextAuth({
  providers: [GoogleProvider({ clientId, clientSecret })],
  pages: { signIn: '/login' },
  callbacks: {
    async session({ session, token }) { return session }
  }
})
```

### Session Access
```ts
import { useSession } from 'next-auth/react'
const { data: session } = useSession()
// session.user.name, session.user.email, session.user.image
```

---

## 11. State Management

The app uses **React Context API** — no Redux or Zustand.

### DoctorStateContext (`components/doctor/DoctorStateContext.tsx`)
Central state store for the doctor dashboard. Provides:

| State | Type | Description |
|---|---|---|
| `patients` | `Patient[]` | Patient list with risk levels |
| `appointments` | `Appointment[]` | Scheduled appointments |
| `predictions` | `Prediction[]` | AI prediction queue |
| `labResults` | `LabResult[]` | Lab test results |
| `testRequests` | `TestRequest[]` | Pending lab requests |
| `notifications` | `Notification[]` | Doctor notifications |
| `patientMetrics` | `PatientMetric[]` | Vital signs history |

All state is initialized with mock data and managed with `useState`. Mutations are passed down via context.

### Patient-side State
Patient pages use local `useState` — no shared context. Each page manages its own cart, booking, and form state independently.

---

## 12. Environment Variables

File: `.env.local`

```env
# NextAuth
NEXTAUTH_URL=http://localhost:4200
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# ML Server (used server-side only by /api/predict proxy)
ML_API_URL=http://localhost:8000
```

> `ML_API_URL` is server-side only. Never prefix it with `NEXT_PUBLIC_` unless you want to expose the ML server URL to the browser.

---

## 13. Setup & Running Locally

### Prerequisites
- Node.js 18+
- Python 3.9+ (for ML server)
- Google OAuth credentials

### 1. Install frontend dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
# Fill in NEXTAUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET
```

### 3. Start the ML / RAG server
```bash
cd Human-Health_model
pip install -r requirements.txt
python -m uvicorn app:app --port 8000
```

### 4. Start the Next.js dev server
```bash
npm run dev
# Runs on http://localhost:4200 (set in NEXTAUTH_URL)
```

### 5. Build for production
```bash
npm run build
npm run start
```

---

## 14. Data Flow Diagrams

### Disease Prediction Flow

```
Patient selects symptoms (SymptomSelector)
        │
        ▼
{ itching: 1, fatigue: 1, headache: 1 }
        │
        ▼
POST /api/predict  (Next.js route — server-side)
        │
        ▼
POST http://localhost:8000/predict  (FastAPI)
        │
        ▼
Apex Neural Network inference
        │
        ▼
{ prediction: "Malaria", confidence: 0.91, method: "..." }
        │
        ▼
Display result card with confidence color:
  ≥85% → green  |  65–84% → yellow  |  <65% → red
        │
        ▼
Open ChatAssistant with disease context
```

### RAG Chat Flow

```
User message + last 8 messages + prediction context
        │
        ▼
POST http://localhost:8000/chat
        │
        ▼
FastAPI RAG Pipeline:
  1. Embed user query
  2. Retrieve top-k medical documents from vector store
  3. Build augmented prompt:
     [System: You are a medical assistant]
     [Context: retrieved docs]
     [Prediction: disease, confidence, symptoms]
     [History: last 8 turns]
     [User: current message]
  4. LLM generates grounded response
        │
        ▼
{ message: "...", type: "info|warning|alert" }
        │
        ▼
Render in chat UI with type-based icon
```

### Authentication Flow

```
/login page
    │
    ▼
signIn("google")  [NextAuth]
    │
    ▼
Google OAuth → callback
    │
    ▼
Session stored (JWT/cookie)
    │
    ▼
useSession() available app-wide via SessionWrapper
    │
    ▼
Redirect → /patient-dashboard
```

### Medicine Order Flow

```
Browse MedicineStore
    │
    ▼
Add to cart (local state)
    │
    ▼
Open CheckoutModals
    │
    ▼
Fill address + payment details
    │
    ▼
Confirm order → OrderModals (success)
    │
    ▼
Order appears in /patient-dashboard/orders
```

### Pathology Booking Flow

```
Browse PathologyScroll / PathologyBookingSystem
    │
    ▼
Select test or package
    │
    ▼
Choose home collection or walk-in
    │
    ▼
PathologyCheckout → confirm slot + payment
    │
    ▼
Booking appears in /patient-dashboard/orders
```

---

*Last updated: April 2026*
