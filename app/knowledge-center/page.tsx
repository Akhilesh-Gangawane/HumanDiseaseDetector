'use client';

import { useState, useRef } from 'react';
import { BookOpen, Brain, Heart, Pill, Activity, Search, ExternalLink, Clock, TrendingUp, Star, ChevronRight, Zap, Shield, Eye, ArrowLeft } from 'lucide-react';
import PatientNavbar from '@/components/patient/PatientNavbar';
import NeuralNetworkContainer from '@/components/ui/NeuralNetworkContainer';
import KnowledgeScroll from '@/components/patient/KnowledgeScroll';
import Footer from '@/components/patient/Footer';
import { useRouter } from 'next/navigation';

// ─── Inline styles / keyframes ───────────────────────────────────────────────
const css = `
  :root {
    --bg: #f8fafc;
    --ink: #1e3a8a;
    --muted: #64748b;
    --accent: #0891b2;
    --accent2: #14b8a6;
    --accent3: #3b82f6;
    --card: #ffffff;
    --border: #e2e8f0;
    --rule: #cbd5e1;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: var(--bg); color: var(--ink); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideRight {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: .4; transform: scale(.7); }
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes shimmer {
    from { background-position: -200% center; }
    to   { background-position:  200% center; }
  }
  @keyframes rotate360 {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .fade-up   { animation: fadeUp .7s ease both; }
  .fade-in   { animation: fadeIn .5s ease both; }
  .float-el  { animation: float 4s ease-in-out infinite; }

  .stagger-1 { animation-delay: .05s; }
  .stagger-2 { animation-delay: .15s; }
  .stagger-3 { animation-delay: .25s; }
  .stagger-4 { animation-delay: .35s; }
  .stagger-5 { animation-delay: .45s; }
  .stagger-6 { animation-delay: .55s; }

  /* Knowledge Circle */
  .knowledge-circle {
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    border: 3px solid rgba(20, 184, 166, 0.3);
    display: none;
    align-items: center;
    justify-content: center;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }
  @media (min-width: 1280px) {
    .knowledge-circle {
      display: flex;
    }
  }
  .knowledge-circle:hover {
    animation: rotate360 0.8s ease-in-out;
    border-color: rgba(20, 184, 166, 0.6);
    box-shadow: 0 0 40px rgba(20, 184, 166, 0.3);
  }
  .knowledge-circle::before {
    content: '';
    position: absolute;
    inset: 10px;
    border-radius: 50%;
    border: 2px dashed rgba(8, 145, 178, 0.3);
    transition: all 0.6s ease;
  }
  .knowledge-circle:hover::before {
    border-color: rgba(8, 145, 178, 0.6);
    transform: rotate(-360deg);
  }
  .knowledge-circle-inner {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(8, 145, 178, 0.1));
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.6s ease;
  }
  .knowledge-circle:hover .knowledge-circle-inner {
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(8, 145, 178, 0.2));
    transform: scale(1.05);
  }
  .knowledge-icon-wrapper {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #14b8a6, #0891b2);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.6s ease;
  }
  .knowledge-circle:hover .knowledge-icon-wrapper {
    transform: scale(1.1);
    box-shadow: 0 8px 24px rgba(20, 184, 166, 0.4);
  }
  .knowledge-circle-text {
    font-size: 12px;
    font-weight: 600;
    color: #14b8a6;
    text-align: center;
    line-height: 1.3;
  }

  /* Ticker */
  .ticker-track { display: flex; width: max-content; animation: marquee 28s linear infinite; }
  .ticker-track:hover { animation-play-state: paused; }

  /* Card hover */
  .article-card {
    position: relative; overflow: hidden;
    transition: transform .3s ease, box-shadow .3s ease;
  }
  .article-card::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, transparent 60%, rgba(8,145,178,.06));
    opacity: 0; transition: opacity .3s ease;
  }
  .article-card:hover { transform: translateY(-5px); box-shadow: 0 20px 48px rgba(30,58,138,.12); }
  .article-card:hover::after { opacity: 1; }

  .cat-card {
    transition: transform .3s ease, box-shadow .3s ease;
    cursor: pointer;
  }
  .cat-card:hover { transform: translateY(-6px) rotate(-1deg); box-shadow: 0 24px 48px rgba(30,58,138,.13); }

  /* Search */
  .search-input:focus { outline: none; border-color: var(--accent2); box-shadow: 0 0 0 3px rgba(20,184,166,.15); }

  /* Rule animation */
  .animated-rule { transform-origin: left; animation: slideRight .8s ease both; }

  /* Shimmer badge */
  .shimmer-badge {
    background: linear-gradient(90deg, var(--accent) 0%, var(--accent2) 50%, var(--accent) 100%);
    background-size: 200% auto;
    animation: shimmer 2.5s linear infinite;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  /* Pill tag */
  .pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; letter-spacing: .04em; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--rule); border-radius: 9px; }
`;

// ─── Data ─────────────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  'New research on GLP-1 drugs',
  'WHO updates flu guidelines',
  'Heart disease prevention 2025',
  'Microbiome & mental health',
  'AI-assisted diagnostics era',
  'Vitamin D deficiency spike',
  'Cancer screening innovations',
  'Sleep & longevity study',
];

const CATEGORIES = [
  { label: 'Cardiology',   icon: Heart,    color: '#0891b2', bg: '#ecfeff', url: 'https://www.heart.org/en/health-topics' },
  { label: 'Neurology',    icon: Brain,    color: '#8b5cf6', bg: '#f5f3ff', url: 'https://www.aan.com/patients/' },
  { label: 'Medications',  icon: Pill,     color: '#3b82f6', bg: '#eff6ff', url: 'https://medlineplus.gov/druginformation.html' },
  { label: 'Wellness',     icon: Activity, color: '#14b8a6', bg: '#f0fdfa', url: 'https://www.health.harvard.edu/topics/wellness' },
  { label: 'Mental Health',icon: Shield,   color: '#f59e0b', bg: '#fffbeb', url: 'https://www.nimh.nih.gov/health' },
  { label: 'Vision',       icon: Eye,      color: '#06b6d4', bg: '#ecfeff', url: 'https://www.aao.org/eye-health' },
  { label: 'Nutrition',    icon: Zap,      color: '#10b981', bg: '#f0fdf4', url: 'https://www.nutrition.gov' },
  { label: 'Trending',     icon: TrendingUp,color:'#6366f1', bg: '#eef2ff', url: 'https://www.webmd.com/news' },
];

const ARTICLES = [
  {
    title: 'Understanding Type 2 Diabetes',
    category: 'Endocrinology',
    tag: 'Essential',
    tagColor: '#0891b2',
    mins: 5,
    stars: 4.8,
    desc: 'Types, symptoms, lifestyle management, and the latest insulin research.',
    url: 'https://www.diabetes.org/diabetes/type-2',
    img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=480&q=80',
  },
  {
    title: 'Heart Health: A Complete Guide',
    category: 'Cardiology',
    tag: 'Popular',
    tagColor: '#3b82f6',
    mins: 4,
    stars: 4.9,
    desc: 'Prevention, diet, exercise, and early warning signs of cardiovascular disease.',
    url: 'https://www.heart.org/en/health-topics/heart-attack',
    img: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=480&q=80',
  },
  {
    title: 'Mental Wellness in 2025',
    category: 'Psychology',
    tag: 'New',
    tagColor: '#8b5cf6',
    mins: 6,
    stars: 4.7,
    desc: 'Evidence-based strategies: CBT, mindfulness, sleep hygiene, and digital detox.',
    url: 'https://www.nimh.nih.gov/health/topics/mental-health-medications',
    img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=480&q=80',
  },
  {
    title: 'Nutrition Science Decoded',
    category: 'Nutrition',
    tag: 'Guide',
    tagColor: '#14b8a6',
    mins: 7,
    stars: 4.6,
    desc: 'Macronutrients, micronutrients, fasting, and personalised eating plans.',
    url: 'https://www.healthline.com/nutrition',
    img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=480&q=80',
  },
  {
    title: 'Exercise for Every Body',
    category: 'Wellness',
    tag: 'Popular',
    tagColor: '#10b981',
    mins: 5,
    stars: 4.8,
    desc: 'Structured workout plans, recovery science, and injury prevention tips.',
    url: 'https://www.mayoclinic.org/healthy-lifestyle/fitness/basics/fitness-basics/hlv-20049447',
    img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=480&q=80',
  },
  {
    title: 'Sleep Disorders Explained',
    category: 'Sleep Medicine',
    tag: 'In-Depth',
    tagColor: '#f59e0b',
    mins: 6,
    stars: 4.7,
    desc: 'Insomnia, sleep apnea, circadian rhythm — diagnosis and treatment options.',
    url: 'https://www.sleepfoundation.org/sleep-disorders',
    img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=480&q=80',
  },
];

const TRUSTED_SOURCES = [
  { name: 'Mayo Clinic',     url: 'https://www.mayoclinic.org',          desc: 'Peer-reviewed patient guides' },
  { name: 'WebMD',           url: 'https://www.webmd.com',               desc: 'News & symptom checker' },
  { name: 'Healthline',      url: 'https://www.healthline.com',          desc: 'Evidence-based articles' },
  { name: 'CDC',             url: 'https://www.cdc.gov/health',          desc: 'Government health data' },
  { name: 'Harvard Health',  url: 'https://www.health.harvard.edu',      desc: 'Medical school insights' },
  { name: 'NHS Inform',      url: 'https://www.nhsinform.scot',          desc: 'UK national health service' },
  { name: 'MedlinePlus',     url: 'https://medlineplus.gov',             desc: 'NLM trusted database' },
  { name: 'PubMed',          url: 'https://pubmed.ncbi.nlm.nih.gov',    desc: 'Peer-reviewed research' },
];

const TRENDING = [
  { label: 'GLP-1 weight loss drugs',   url: 'https://www.ncbi.nlm.nih.gov/search/research-articles/?term=GLP-1' },
  { label: 'Longevity biomarkers',       url: 'https://www.healthline.com/health/longevity' },
  { label: 'Gut-brain axis',             url: 'https://www.health.harvard.edu/blog/the-gut-brain-connection' },
  { label: 'Ozempic side effects',       url: 'https://www.webmd.com/drugs/2/drug-183464/ozempic-subcutaneous/details' },
  { label: 'Intermittent fasting 2025',  url: 'https://www.healthline.com/nutrition/intermittent-fasting-guide' },
  { label: 'AI diagnostics',             url: 'https://www.nature.com/subjects/medical-imaging' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function KnowledgeCenterPage() {
  const router = useRouter();
  const [showDashboard, setShowDashboard] = useState(false);
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const observers = useRef<Record<string, IntersectionObserver>>({});

  const filtered = ARTICLES.filter(a =>
    !query || a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  // Intersection-observer based reveal
  const observe = (id: string) => (el: HTMLElement | null) => {
    if (!el || observers.current[id]) return;
    observers.current[id] = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(v => ({ ...v, [id]: true }));
    }, { threshold: 0.15 });
    observers.current[id].observe(el);
  };

  if (!showDashboard) {
    return (
      <>
        <KnowledgeScroll onScrollComplete={() => setShowDashboard(true)} />
      </>
    );
  }

  return (
    <>
      <style>{css}</style>

      <NeuralNetworkContainer className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white">
        <PatientNavbar />
        
        {/* Spacer for fixed navbar */}
        <div style={{ height: '64px' }} />

        <div style={{ minHeight: '100vh', background: 'transparent' }}>

        {/* ── Ticker ────────────────────────────────────────────────────────── */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0891b2 100%)', color: '#f8f6f1', fontSize: 12, padding: '7px 0', overflow: 'hidden', fontWeight: 500, letterSpacing: '.06em' }}>
          <div className="ticker-track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
              <span key={i} style={{ whiteSpace: 'nowrap', padding: '0 32px' }}>
                <span style={{ color: '#14b8a6', marginRight: 8 }}>●</span>{t.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0891b2 100%)', padding: '64px 24px 72px', position: 'relative', overflow: 'hidden' }}>
          
          {/* Left Knowledge Circle */}
          <div className="knowledge-circle" style={{ top: '50%', left: '5%', transform: 'translateY(-50%)' }}>
            <div className="knowledge-circle-inner">
              <div className="knowledge-icon-wrapper">
                <BookOpen style={{ width: 24, height: 24, color: 'white' }} />
              </div>
              <span className="knowledge-circle-text">Medical<br/>Knowledge</span>
            </div>
          </div>

          {/* Right Knowledge Circle */}
          <div className="knowledge-circle" style={{ top: '50%', right: '5%', transform: 'translateY(-50%)' }}>
            <div className="knowledge-circle-inner">
              <div className="knowledge-icon-wrapper">
                <Brain style={{ width: 24, height: 24, color: 'white' }} />
              </div>
              <span className="knowledge-circle-text">AI-Powered<br/>Insights</span>
            </div>
          </div>
          
          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            <div className="fade-up stagger-1" style={{ display: 'inline-block', background: 'rgba(20,184,166,.18)', border: '1px solid rgba(20,184,166,.4)', borderRadius: 99, padding: '4px 16px', marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', color: '#14b8a6', textTransform: 'uppercase' }}>Health Knowledge Hub</span>
            </div>

            <h1 className="fade-up stagger-2" style={{ fontSize: 'clamp(42px, 6vw, 76px)', fontWeight: 900, color: '#f8f6f1', lineHeight: 1.08, marginBottom: 20, letterSpacing: '-0.02em' }}>
              Know Your<br /><em style={{ color: '#14b8a6', fontStyle: 'italic' }}>Health</em>
            </h1>
            <p className="fade-up stagger-3" style={{ fontSize: 17, color: 'rgba(248,246,241,.6)', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.7 }}>
              Curated medical knowledge from trusted sources — articles, research, and expert guides in one place.
            </p>

            {/* Search */}
            <div className="fade-up stagger-4" style={{ position: 'relative', maxWidth: 520, margin: '0 auto' }}>
              <input
                className="search-input"
                type="text"
                placeholder="Search diseases, symptoms, treatments…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{
                  width: '100%', padding: '16px 52px 16px 20px',
                  borderRadius: 12, border: '1.5px solid rgba(248,246,241,.18)',
                  background: 'rgba(248,246,241,.08)', color: '#f8f6f1',
                  fontSize: 15, backdropFilter: 'blur(8px)',
                  transition: 'all .3s ease',
                }}
              />
              <Search style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', color: 'rgba(248,246,241,.5)', width: 20, height: 20 }} />
            </div>
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────────────────── */}
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '64px 24px' }}>

          {/* Back Button */}
          <div style={{ marginBottom: '48px' }}>
            <button
              onClick={() => router.push('/patient-dashboard')}
              className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">Back to Home</span>
            </button>
          </div>

          {/* ── Categories ──────────────────────────────────────────────────── */}
          <div ref={observe('cats')} style={{ marginBottom: 72 }}>
            <SectionHead label="Browse Categories" rule />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))', gap: 16, marginTop: 32 }}>
              {CATEGORIES.map((c, i) => {
                const Icon = c.icon;
                return (
                  <a
                    key={c.label}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`cat-card fade-up stagger-${Math.min(i + 1, 6)}`}
                    style={{
                      background: c.bg, borderRadius: 16, padding: '24px 12px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                      textDecoration: 'none', border: '1px solid transparent',
                    }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: c.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon style={{ width: 22, height: 22, color: c.color }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', textAlign: 'center' }}>{c.label}</span>
                    <ExternalLink style={{ width: 12, height: 12, color: c.color, opacity: .6 }} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* ── Trending topics ──────────────────────────────────────────────── */}
          <div style={{ marginBottom: 72 }}>
            <SectionHead label="Trending Now" accent />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 24 }}>
              {TRENDING.map((t, i) => (
                <a
                  key={i}
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`fade-up stagger-${Math.min(i + 1, 6)}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 18px', borderRadius: 99,
                    background: 'var(--card)', border: '1px solid var(--border)',
                    fontSize: 13, fontWeight: 500, color: 'var(--ink)',
                    textDecoration: 'none',
                    transition: 'all .25s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #1e3a8a 0%, #0891b2 100%)'; e.currentTarget.style.color = '#f8f6f1'; e.currentTarget.style.borderColor = '#0891b2'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <TrendingUp style={{ width: 13, height: 13, color: 'var(--accent)' }} />
                  {t.label}
                </a>
              ))}
            </div>
          </div>

          {/* ── Featured Articles ────────────────────────────────────────────── */}
          <div style={{ marginBottom: 72 }}>
            <SectionHead label="Featured Articles" rule />
            {filtered.length === 0 && (
              <p style={{ marginTop: 32, color: 'var(--muted)', fontStyle: 'italic' }}>No articles match your search.</p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 24, marginTop: 32 }}>
              {filtered.map((a, i) => (
                <ArticleCard key={a.title} article={a} delay={i} />
              ))}
            </div>
          </div>

          {/* ── Trusted Sources ──────────────────────────────────────────────── */}
          <div style={{ marginBottom: 72 }}>
            <SectionHead label="Trusted Sources" rule />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginTop: 32 }}>
              {TRUSTED_SOURCES.map((s, i) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`fade-up article-card stagger-${Math.min(i + 1, 6)}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: 'var(--card)', border: '1px solid var(--border)',
                    borderRadius: 14, padding: '18px 20px', textDecoration: 'none',
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.desc}</div>
                  </div>
                  <ExternalLink style={{ width: 14, height: 14, color: 'var(--muted)', marginLeft: 'auto', flexShrink: 0 }} />
                </a>
              ))}
            </div>
          </div>

          {/* ── CTA Banner ───────────────────────────────────────────────────── */}
          <div className="float-el" style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0891b2 100%)', borderRadius: 24, padding: '52px 40px',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: -40, top: -40, width: 220, height: 220, borderRadius: '50%', background: 'rgba(20,184,166,.18)' }} />
            <div style={{ position: 'absolute', right: 60, bottom: -60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(59,130,246,.12)' }} />
            <div style={{ position: 'relative' }}>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: '#f8f6f1', fontWeight: 900, marginBottom: 10, letterSpacing: '-0.02em' }}>
                Stay Informed.<br /><em style={{ color: '#14b8a6' }}>Stay Healthy.</em>
              </h2>
              <p style={{ color: 'rgba(248,246,241,.55)', fontSize: 15 }}>Get weekly curated health insights from our experts.</p>
            </div>
            <a
              href="https://www.health.harvard.edu/newsletter-subscription"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: 'relative', background: '#14b8a6', color: '#fff',
                padding: '15px 32px', borderRadius: 12, fontWeight: 700, fontSize: 15,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'transform .2s ease, box-shadow .2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(20,184,166,.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              Subscribe Free <ChevronRight style={{ width: 18, height: 18 }} />
            </a>
          </div>

        </div>
      </div>

      <Footer />
      </NeuralNetworkContainer>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function SectionHead({ label, rule, accent }: { label: string; rule?: boolean; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color: accent ? 'var(--accent)' : 'var(--ink)', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{label}</h2>
      {rule && <hr className="animated-rule" style={{ flex: 1, border: 'none', borderTop: '1.5px solid var(--rule)', transformOrigin: 'left' }} />}
    </div>
  );
}

function ArticleCard({ article: a, delay }: { article: typeof ARTICLES[0]; delay: number }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={a.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`article-card fade-up stagger-${Math.min(delay + 1, 6)}`}
      style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 18, overflow: 'hidden', textDecoration: 'none', display: 'block',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Image */}
      <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
        <img
          src={a.img}
          alt={a.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s ease', transform: hov ? 'scale(1.08)' : 'scale(1)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,22,20,.4), transparent)' }} />
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span className="pill" style={{ background: a.tagColor + '22', color: a.tagColor, border: `1px solid ${a.tagColor}44` }}>{a.tag}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 20px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', color: 'var(--muted)', textTransform: 'uppercase' }}>{a.category}</span>
          <span style={{ color: 'var(--rule)' }}>·</span>
          <Clock style={{ width: 11, height: 11, color: 'var(--muted)' }} />
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{a.mins} min</span>
          <span style={{ color: 'var(--rule)' }}>·</span>
          <Star style={{ width: 11, height: 11, color: '#e5a81a', fill: '#e5a81a' }} />
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{a.stars}</span>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.3, letterSpacing: '-0.01em' }}>{a.title}</h3>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 14 }}>{a.desc}</p>
        <span style={{ fontSize: 13, fontWeight: 600, color: a.tagColor, display: 'flex', alignItems: 'center', gap: 4, transition: 'gap .2s ease' }}>
          Read Article <ExternalLink style={{ width: 12, height: 12 }} />
        </span>
      </div>
    </a>
  );
}