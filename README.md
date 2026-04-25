# Human Disease Detector - AI-Powered Healthcare Platform

A comprehensive healthcare web application built with Next.js that combines AI-driven disease prediction with essential medical services. The platform features premium, cinematic UI with scroll-driven animations, canvas-based image sequences, and smooth interactions.

## 🌟 Overview

Leveraging artificial intelligence to provide early disease detection, personalized health insights, and intelligent medical support for better healthcare outcomes. The system can classify symptoms into 669 different diseases with ~80% accuracy.

## ✨ Key Features

### Patient Features
- **AI Disease Prediction**: Machine learning model that analyzes symptoms using graph-based features and symptom relationships
- **Interactive Symptom Checker**: User-friendly form with real-time predictions
- **AI Medical Assistant**: Chat interface for health advice and medical information
- **Service Integration**:
  - Online consultations (OPD)
  - Medicine ordering
  - Pathology lab bookings
  - Health knowledge center
- **Mouse-Controlled Hero Animation**: Interactive 3D rotating image sequence (127 frames)
- **Scroll-Based Animations**: Smooth canvas animations for services showcase

### Doctor Dashboard
- Complete appointment management system
- Patient records and history
- AI prediction review interface
- Prescription generator
- Reports and analytics
- Real-time notifications

### UI/UX Features
- **Animated Feature Cards** with dynamic backgrounds:
  - AI Diagnosis - Pulsing Neural Nodes
  - 24/7 Monitoring - EKG heartbeat wave
  - Expert Network - Floating bokeh particles
  - Secure & Private - Digital shield/grid
  - Health Analytics - Growing data pillars
  - Mobile Access - Floating glass UI elements
- **Neural Network Background**: Interactive particles with mouse reaction
- **Glassmorphism Design**: Modern glass-effect cards and overlays
- **Smooth Scroll**: Lenis-powered smooth scrolling
- **Framer Motion**: Professional animations throughout
- **Responsive Design**: Optimized for all devices

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animation library
- **Lenis** - Smooth scroll library
- **Canvas API** - High-performance animations

### Backend (Model)
- **Python 3.x** - Core language
- **Flask** - API framework
- **scikit-learn 1.8.0** - Machine learning
- **XGBoost (GPU)** - Gradient boosting with GPU acceleration
- **Node2Vec** - Graph-based feature engineering
- **pandas** - Data processing
- **joblib** - Model serialization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- npm or yarn
- NVIDIA GPU (optional, for model training)

### Frontend Installation

1. Clone the repository:
```bash
git clone https://github.com/Akhilesh-Gangawane/HumanDiseaseDetector.git
cd HumanDiseaseDetector
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Backend (Model) Setup

1. Navigate to Model directory:
```bash
cd Human-Health_model
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the Flask API:
```bash
python app.py
```

4. Test the API:
```bash
python test_app.py
```

The API will run on `http://localhost:5000`

## 📁 Project Structure

```
├── app/
│   ├── dashboard/              # Doctor dashboard pages
│   ├── patient-dashboard/      # Patient dashboard pages
│   ├── login/                  # Authentication
│   ├── buy-medicine/           # Medicine ordering
│   ├── consult-doctor/         # OPD consultations
│   ├── pathology/              # Lab bookings
│   ├── knowledge-center/       # Health information
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
├── components/
│   ├── landing/                # Landing page components
│   │   ├── Navbar.tsx
│   │   ├── HeroVideo.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── HealthScroll.tsx
│   │   ├── AboutSection.tsx
│   │   └── Footer.tsx
│   ├── patient/                # Patient components
│   │   ├── HeroSection.tsx
│   │   ├── HeroScroll.tsx      # Mouse-controlled animation
│   │   ├── FeatureCards.tsx
│   │   ├── PredictionForm.tsx
│   │   ├── ChatAssistant.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── KnowledgeScroll.tsx
│   │   ├── MedicineScroll.tsx
│   │   ├── OpdScroll.tsx
│   │   └── PathologyScroll.tsx
│   ├── doctor/                 # Doctor dashboard components
│   │   ├── DashboardHeader.tsx
│   │   ├── Sidebar.tsx
│   │   ├── PatientManagement.tsx
│   │   ├── AIPredictionReview.tsx
│   │   └── PrescriptionGenerator.tsx
│   ├── ui/                     # Reusable UI components
│   │   ├── AnimatedBackground.tsx
│   │   ├── NeuralNetworkBackground.tsx
│   │   ├── NeuralNetworkContainer.tsx
│   │   ├── FeatureBackgrounds.tsx
│   │   ├── BackgroundPatterns.tsx
│   │   ├── GlassCard.tsx
│   │   └── GradientButton.tsx
│   ├── animations/             # Animation components
│   └── LenisProvider.tsx       # Smooth scroll provider
├── hooks/
│   ├── useImagePreloader.ts    # Image sequence preloader
│   └── usePageTransition.ts
├── lib/
│   ├── config/
│   ├── constants/
│   ├── data/
│   └── types/
├── Model/                      # ML Backend
│   ├── app.py                  # Flask API
│   ├── train_optuna.py         # Model training
│   ├── evaluate.py             # Model evaluation
│   ├── pipeline.py             # ML pipeline
│   ├── graph_features.py       # Node2Vec features
│   ├── symptom_relationships.py
│   ├── best_pipeline.joblib    # Trained model
│   ├── symptom_embeddings.joblib
│   ├── label_encoder.joblib
│   ├── feature_names.joblib
│   └── requirements.txt
└── public/
    ├── herosection.mp4         # Hero video
    ├── hero-images/            # 127 frames for hero animation
    ├── knowledge-scroll/       # 145 frames
    ├── medicine-scroll/        # 145 frames
    ├── opd-scroll/             # 145 frames
    ├── path-scroll/            # 145 frames
    └── *.png                   # Icons and images
```

## 🎨 UI Components Guide

### AnimatedBackground
Premium animated background with gradient blobs and floating particles.

```tsx
import AnimatedBackground from '@/components/ui/AnimatedBackground'

<div className="relative min-h-screen">
  <AnimatedBackground />
  <div className="relative z-10">
    {/* Your content */}
  </div>
</div>
```

### NeuralNetworkBackground
Interactive neural network with mouse-reactive particles.

```tsx
import NeuralNetworkContainer from '@/components/ui/NeuralNetworkContainer'

<NeuralNetworkContainer className="min-h-screen">
  {/* Your content */}
</NeuralNetworkContainer>
```

### HeroScroll
Mouse-controlled 3D rotating image sequence.

```tsx
import HeroScroll from '@/components/patient/HeroScroll'

<div className="w-full h-[500px]">
  <HeroScroll />
</div>
```

## 🧠 ML Model Details

### Performance Metrics
| Metric | Baseline | With Graph Features |
|--------|----------|---------------------|
| Accuracy | 79-80% | **80%** |
| Macro F1 | 0.70 | **0.76 (+6%)** |
| Weighted F1 | 0.78 | **0.80 (+2%)** |

### Key Features
- **669 Disease Classes**: High granularity classification
- **Graph-Based Features**: Node2Vec embeddings (32D) from symptom co-occurrence network
- **GPU Acceleration**: XGBoost with NVIDIA CUDA support
- **Explainable AI**: Feature importance analysis
- **Robust Pipeline**: Handles missing data and type consistency

### Model Architecture
1. **Data Processing**: Chunked processing of 614MB dataset
2. **Feature Engineering**: 
   - Symptom co-occurrence matrix
   - Node2Vec graph embeddings
   - 32-dimensional symptom representations
3. **Ensemble Model**: XGBoost with optimized hyperparameters
4. **Prediction Pipeline**: Integrated graph features for inference

### API Endpoints
- `POST /predict` - Disease prediction from symptoms
- `GET /health` - API health check

## 🏗️ Build for Production

### Frontend
```bash
npm run build
npm start
```

### Backend
```bash
# Ensure all dependencies are installed
pip install -r Model/requirements.txt

# Run production server
python Model/app.py
```

## 🌐 Deployment

### Frontend (Vercel - Recommended)
```bash
npm install -g vercel
vercel
```

### Backend Options
- **AWS EC2** with GPU for model serving
- **Google Cloud Run** for containerized deployment
- **Heroku** for simple deployment
- **Docker** for containerization

## 📱 Responsive Breakpoints

- **Desktop**: 1920px+
- **Laptop**: 1024px - 1919px
- **Tablet**: 768px - 1023px
- **Mobile**: 320px - 767px

## ⚡ Performance Optimizations

### Frontend
- Image preloading with progress indicators
- Canvas rendering optimization
- 60fps scroll animations
- Lazy loading for off-screen components
- Code splitting and tree shaking
- Optimized bundle size

### Backend
- GPU-accelerated inference
- Efficient feature extraction
- Model caching
- Batch prediction support

## 🎯 Future Enhancements

- [ ] Real-time chat with healthcare professionals
- [ ] Medical records management system
- [ ] Appointment scheduling with calendar integration
- [ ] Telemedicine video consultations
- [ ] Prescription management and refills
- [ ] Health tracking and analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Probability calibration for rare diseases
- [ ] Hierarchical disease classification
- [ ] Model versioning with MLflow/DVC

## 🔧 Troubleshooting

### Model Prediction Errors
- Ensure scikit-learn version matches (1.8.0)
- Verify all joblib files are present
- Check input data types (float64)
- Retrain model if necessary: `python Model/train_optuna.py`

### Frontend Issues
- Clear `.next` cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

## 📄 License

Internal Project - Healthcare AI Platform

## 👥 Contributors

**Akhilesh Gangawane**
- GitHub: [@Akhilesh-Gangawane](https://github.com/Akhilesh-Gangawane)

## 🙏 Acknowledgments

- Medical dataset providers
- Open-source community
- Healthcare professionals for domain expertise

---

**Note**: This project combines frontend and backend. The ML model requires separate setup and can run independently of the frontend.

For detailed API documentation, see the Model directory README.
For component usage examples, refer to the components directory.
