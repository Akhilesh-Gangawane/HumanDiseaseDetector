# Dhanvantari AI - Healthcare Platform Frontend

A premium, cinematic healthcare landing page featuring scroll-driven animations, canvas-based image sequences, and smooth interactions with a beautiful sky blue and white theme.

## ✨ Features

### Animated Feature Cards
- **AI Diagnosis** - Pulsing Neural Nodes with connecting lines suggesting "thinking"
- **24/7 Monitoring** - Smooth Sine Wave (EKG heartbeat line)
- **Expert Network** - Soft Bokeh Particles (floating light orbs)
- **Secure & Private** - Digital Shield/Grid with scanning line
- **Health Analytics** - Growing Data Pillars (bars that rise and fall)
- **Mobile Access** - Floating App UI Glass (3D moving rectangles)

### Page Sections
- Responsive navigation bar with "Dhanvantari AI" branding
- Full-screen hero video background with animated text
- Interactive features section with animated backgrounds
- How It Works section with 4-step process
- Canvas-based scroll animation (128 frames)
- About section with statistics
- Call-to-action section with metrics
- Footer with links and social media
- Smooth scroll with Lenis
- Framer Motion animations throughout

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animation library
- **Lenis** - Smooth scroll library

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Akhilesh-Gangawane/HumanDiseaseDetector.git
cd HumanDiseaseDetector
git checkout Frontend-V-1
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
├── app/
│   ├── dashboard/          # Doctor dashboard pages
│   ├── patient-dashboard/  # Patient dashboard pages
│   ├── login/              # Login page
│   ├── layout.tsx          # Root layout with Lenis provider
│   ├── page.tsx            # Main landing page
│   └── globals.css         # Global styles
├── components/
│   ├── landing/            # Landing page components
│   │   ├── Navbar.tsx
│   │   ├── HeroVideo.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── HealthScroll.tsx
│   │   ├── AboutSection.tsx
│   │   ├── ContactSection.tsx
│   │   ├── CTASection.tsx
│   │   └── Footer.tsx
│   ├── doctor/             # Doctor dashboard components
│   ├── patient/            # Patient dashboard components
│   ├── ui/                 # Reusable UI components
│   │   ├── FeatureBackgrounds.tsx  # Animated backgrounds
│   │   ├── GlassCard.tsx
│   │   ├── GradientButton.tsx
│   │   └── ScrollProgress.tsx
│   ├── animations/         # Animation components
│   └── LenisProvider.tsx   # Smooth scroll provider
├── hooks/
│   ├── useImagePreloader.ts
│   └── usePageTransition.ts
├── lib/
│   ├── config/
│   ├── constants/
│   ├── data/
│   └── types/
└── public/
    ├── herosection.mp4     # Hero video
    ├── logo.png
    └── scroll-sequence/    # 128 frame images for scroll animation
```

## 🎨 Key Components

### FeatureBackgrounds.tsx
Contains all animated SVG backgrounds for feature cards:
- `NeuralNetworkBg` - Pulsing nodes with connections
- `EKGWaveBg` - Flowing heartbeat wave
- `NetworkMapBg` - Floating bokeh particles
- `LockSecurityBg` - Scanning grid with hexagons
- `AnalyticsChartBg` - Growing bar chart
- `MobileAppBg` - Floating glass UI elements

### HealthScroll.tsx
Canvas-based scroll animation that plays through 128 frames as user scrolls.

### LenisProvider.tsx
Provides smooth scrolling experience across the entire application.

## 🏗️ Build for Production

```bash
npm run build
npm start
```

## 🌐 Deployment

The application can be deployed to:
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- Any Node.js hosting service

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## ⚡ Performance Optimizations

- Image preloading with progress indicator
- Canvas rendering optimization
- Smooth 60fps scroll animations
- Lazy loading for off-screen components
- Optimized bundle size with code splitting

## 🎯 Future Enhancements

- Integration with backend API for disease prediction
- User authentication and authorization
- Patient and doctor dashboard functionality
- Real-time chat with healthcare professionals
- Medical records management
- Appointment scheduling system

## 📄 License

Internal Project - Healthcare AI Platform

## 👥 Contributors

Akhilesh Gangawane

---

**Note:** This is the frontend repository. The backend API with ML models is maintained separately.
