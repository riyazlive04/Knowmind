'use client'

import Link from 'next/link'
import {
  Compass,
  Waves,
  Flame,
  Heart,
  Handshake,
  Link2,
  Brain,
  Sprout,
  Check,
  Phone,
  Mail,
  Globe,
  ArrowRight,
  Quote,
  RotateCcw,
} from 'lucide-react'
import { Button, Card, Pill } from '@/components/ui'

const STATS = [
  { value: '14+', label: 'Years of experience' },
  { value: '800+', label: 'Therapy sessions' },
  { value: '1,200+', label: 'Professionals trained' },
  { value: '100+', label: 'Organizations' },
]

const DOMAINS = [
  { Icon: Compass, name: 'Self-Awareness', desc: 'Recognise your emotions as they happen.' },
  { Icon: Waves, name: 'Self-Regulation', desc: 'Stay steady and manage impulses under pressure.' },
  { Icon: Flame, name: 'Motivation', desc: 'Channel drive and resilience toward your goals.' },
  { Icon: Heart, name: 'Empathy', desc: 'Sense and understand what others are feeling.' },
  { Icon: Handshake, name: 'Social & Leadership', desc: 'Influence, communicate, and lead effectively.' },
  { Icon: Link2, name: 'Relationship Intelligence', desc: 'Build and sustain strong connections.' },
]

const CREDENTIALS = [
  'Dual Master’s — Counselling & Psychotherapy · Applied Psychology',
  'PhD Scholar in Psychology',
  'Certified Corporate Master Trainer (IATD)',
  'NLP Practitioner · Clinical Hypnotherapist',
  'CBT · REBT · Expressive Arts Therapies',
  'Experiential Learning Facilitator (IIPE, Canada)',
  'PG Diploma in Yoga',
  'Former — McKinsey & Company',
]

const REASONS = [
  {
    title: 'Deep psychological & leadership insight',
    desc: 'Blends psychology, leadership science, neuroscience and mindfulness to transform thoughts, emotions and behaviour.',
  },
  {
    title: 'Assessment-driven design',
    desc: 'Builds competency-based programs using 360° assessments and psychometric tools to diagnose needs and track outcomes.',
  },
  {
    title: 'Experiential & engaging',
    desc: 'High-energy, activity-based learning with storytelling, group coaching and reflection that changes real-world behaviour.',
  },
  {
    title: 'Authentic, sustainable change',
    desc: 'Interventions that translate into lasting mindset, emotional and cultural transformation — not one-off workshops.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b border-ink-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="KnowMind Universe" className="h-10 w-auto" />
            <div className="leading-tight">
              <h1 className="text-xl font-bold text-purple-800 font-display tracking-tight">
                KnowMind
              </h1>
              <p className="text-[10px] uppercase tracking-[0.15em] text-ink-400">Universe</p>
            </div>
          </div>
          <nav className="flex items-center gap-1 sm:gap-3">
            <a href="#founder" className="hidden sm:inline-flex text-ink-700 hover:text-purple-700 font-medium px-3 py-2 rounded-md transition-colors">
              About
            </a>
            <a href="#domains" className="hidden sm:inline-flex text-ink-700 hover:text-purple-700 font-medium px-3 py-2 rounded-md transition-colors">
              The 6 domains
            </a>
            <Link href="/assessment" className="inline-flex">
              <Button variant="primary" className="h-10 px-5">Take the assessment</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-grad-hero text-white">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 flex min-h-[calc(100vh-72px)] items-center">
          <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: message */}
            <div className="space-y-7">
              <Pill band="developing">For entrepreneurs &amp; leaders</Pill>
              <h2 className="text-4xl md:text-[3.25rem] font-bold text-white font-display leading-[1.08] tracking-tight">
                Great leadership starts with{' '}
                <span className="text-gold-400">emotional intelligence.</span>
              </h2>
              <p className="text-lg md:text-xl text-purple-100 leading-relaxed max-w-xl">
                Measure how well you understand and manage emotions across 6 domains — and
                get a personalized report and action plan to grow.
              </p>
              <p className="text-sm text-purple-200">
                Designed by <span className="font-semibold text-white">Kaleeswaran</span> —
                Psychologist &amp; Corporate Trainer, 14+ years&apos; experience.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-1">
                <Link href="/assessment" className="inline-flex">
                  <Button variant="primary" className="h-[52px] px-8 text-base">
                    Start the assessment
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/results" className="inline-flex">
                  <Button variant="secondary" className="h-[52px] px-6 text-base">
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Get my previous results
                  </Button>
                </Link>
                <a href="#founder" className="inline-flex">
                  <Button variant="ghost" className="h-[52px] px-6 text-base !text-white hover:!bg-white/10">
                    Meet the founder
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 text-sm text-purple-100">
                {['27 questions', '6 EI domains', '~10 minutes', 'Personalized report'].map((f) => (
                  <span key={f} className="inline-flex items-center gap-2">
                    <Check className="h-4 w-4 text-gold-400" aria-hidden="true" />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: founder — cut-out portrait with details below */}
            <div className="relative mx-auto flex w-full max-w-md flex-col items-center">
              <div className="relative w-full">
                <img
                  src="/kaleeswaran-cut.png"
                  onError={(e) => {
                    const el = e.currentTarget
                    el.onerror = null
                    el.src = '/kaleeswaran.png'
                  }}
                  alt="Kaleeswaran — Founder of KnowMind Universe"
                  className="relative mx-auto h-[580px] w-auto object-contain drop-shadow-2xl md:h-[680px]"
                />
              </div>
              <div className="mt-1 text-center">
                <p className="font-display text-2xl font-bold text-white">Kaleeswaran</p>
                <p className="text-sm text-purple-200">
                  Lead Psychologist · Trainer · Coach
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* positioning strip */}
        <div className="relative border-t border-white/10 bg-purple-900/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-1 text-sm text-purple-100">
            <span className="font-semibold text-white">KnowMind Universe</span>
            <span className="inline-flex items-center gap-2"><span className="text-gold-400">•</span> Training</span>
            <span className="inline-flex items-center gap-2"><span className="text-gold-400">•</span> Coaching</span>
            <span className="inline-flex items-center gap-2"><span className="text-gold-400">•</span> Therapy</span>
          </div>
        </div>
      </section>

      {/* Impact stats */}
      <section className="bg-white border-b border-ink-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl md:text-4xl font-bold text-purple-800">{s.value}</p>
              <p className="mt-1 text-sm text-ink-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why EI */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center mb-12 animate-fade-in-up">
          <h3 className="text-3xl md:text-4xl font-bold text-purple-800 font-display">
            IQ gets you in the room. EI makes you a leader.
          </h3>
          <p className="mt-4 text-lg text-ink-500 leading-relaxed">
            Emotional intelligence isn&apos;t a fixed trait — it&apos;s a skill you can measure,
            understand, and grow. Here&apos;s what it changes.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { Icon: Brain, title: 'Lead with clarity', desc: 'Regulate your reactions and make better decisions when the pressure is on.' },
            { Icon: Handshake, title: 'Connect deeply', desc: 'Read the room, build trust, and strengthen every relationship you rely on.' },
            { Icon: Sprout, title: 'Grow with resilience', desc: 'Turn setbacks into momentum with self-awareness and steady motivation.' },
          ].map((c) => (
            <Card key={c.title} className="p-8 space-y-3 hover-lift">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                <c.Icon className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
              </div>
              <h4 className="text-xl font-bold text-purple-800 font-display">{c.title}</h4>
              <p className="text-ink-500 leading-relaxed">{c.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* The 6 domains */}
      <section id="domains" className="bg-grad-lavender py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <Pill band="emerging">The KnowMind framework</Pill>
            <h3 className="mt-4 text-3xl md:text-4xl font-bold text-purple-800 font-display">
              Your emotional intelligence, across 6 domains
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DOMAINS.map((d) => (
              <Card key={d.name} className="p-6 flex items-start gap-4 hover-lift">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                  <d.Icon className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-bold text-purple-800 font-display">{d.name}</h4>
                  <p className="mt-1 text-sm text-ink-500 leading-relaxed">{d.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's in your report */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-5">
          <Pill band="pending">Your personalized report</Pill>
          <h3 className="text-3xl md:text-4xl font-bold text-purple-800 font-display leading-tight">
            More than a score — a roadmap.
          </h3>
          <p className="text-lg text-ink-500 leading-relaxed">
            Every assessment produces a confidential report designed to help you act, not just
            reflect.
          </p>
          <ul className="space-y-3">
            {[
              'Your overall EI score, out of 5',
              'A breakdown across all 6 dimensions',
              'Your primary strength and biggest growth opportunity',
              'A personalized action plan and next step',
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
                <span className="text-ink-700">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <Card className="p-6 space-y-4 shadow-lg">
          <div className="rounded-xl bg-grad-hero p-5 text-white flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-100 opacity-85">Overall EI Score</p>
              <p className="font-display text-4xl font-bold">3.9<span className="text-lg text-purple-100"> / 5</span></p>
            </div>
            <Pill band="emerging">Emerging</Pill>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Self-Awareness', v: 4.2 },
              { name: 'Empathy', v: 4.6 },
              { name: 'Self-Regulation', v: 3.4 },
              { name: 'Relationship Intelligence', v: 2.8 },
            ].map((r) => (
              <div key={r.name} className="flex items-center gap-3">
                <span className="w-44 text-sm text-ink-700">{r.name}</span>
                <div className="flex-1 h-2 rounded-full bg-ink-100 overflow-hidden">
                  <div className="h-full rounded-full bg-grad-accent" style={{ width: `${(r.v / 5) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-sm font-semibold text-ink-700">{r.v}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Meet the founder */}
      <section id="founder" className="bg-white border-y border-ink-100 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-5 gap-10 items-start">
          {/* Photo */}
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute -inset-2 rounded-3xl bg-grad-lavender opacity-70 blur-lg" />
              <img
                src="/kaleeswaran.png"
                alt="Kaleeswaran — Founder of KnowMind Universe"
                className="relative w-full rounded-2xl object-cover shadow-lg"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <Pill band="emerging">Meet your guide</Pill>
              <h3 className="mt-4 text-3xl md:text-4xl font-bold text-purple-800 font-display">
                Kaleeswaran
              </h3>
              <p className="mt-1 text-ink-500">
                Psychologist · International Experiential Corporate Trainer · Coach · Keynote Speaker
              </p>
            </div>
            <p className="text-ink-700 leading-relaxed">
              For 14+ years, Kaleeswaran has blended psychology with experiential learning to
              drive measurable change. Founder of the{' '}
              <span className="font-semibold text-purple-800">OOKKAM Foundation</span> and
              formerly with <span className="font-semibold text-purple-800">McKinsey &amp; Company</span>,
              he combines neuroscience, emotional intelligence and mindfulness to grow leaders.
            </p>

            <div className="flex flex-wrap gap-2">
              {CREDENTIALS.map((c) => (
                <span key={c} className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700">
                  {c}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {REASONS.map((r) => (
                <div key={r.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-grad-accent text-purple-900">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold text-ink-900">{r.title}</p>
                    <p className="text-sm text-ink-500 leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* In action gallery */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-10">
          <Pill band="strong">In action</Pill>
          <h3 className="mt-4 text-3xl md:text-4xl font-bold text-purple-800 font-display">
            From packed auditoriums to outbound experiences
          </h3>
          <p className="mt-3 text-ink-500 max-w-2xl mx-auto">
            Keynotes, corporate programs, and outbound training — the same rigour now powers
            your assessment.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {[
            { src: '/impact-keynote.png', cap: 'Keynote to a packed auditorium' },
            { src: '/impact-obt.png', cap: 'Outbound experiential training (OBT)' },
          ].map((g) => (
            <figure key={g.src} className="group relative overflow-hidden rounded-2xl shadow-md hover-lift">
              <img
                src={g.src}
                alt={g.cap}
                className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-purple-900/80 to-transparent p-4 text-sm font-medium text-white">
                {g.cap}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Founder quote */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="relative overflow-hidden rounded-3xl bg-grad-hero shadow-hero px-6 py-12 md:px-14 md:py-16">
          {/* Decorative accents */}
          <Quote
            className="pointer-events-none absolute -top-2 left-6 h-24 w-24 text-white/10"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-grad-accent opacity-20 blur-2xl" />

          <div className="relative flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-10">
            <div className="flex-shrink-0">
              <div className="h-28 w-28 overflow-hidden rounded-2xl border-2 border-white/20 shadow-lg md:h-32 md:w-32">
                <img
                  src="/kaleeswaran.png"
                  alt="Kaleeswaran, Founder of KnowMind Universe"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="text-center md:text-left">
              <blockquote className="font-display text-xl md:text-[26px] font-medium leading-snug text-white">
                Emotional intelligence isn&apos;t something you&apos;re born with or without. It&apos;s
                a skill you can <span className="text-gold-300">measure, understand, and grow</span> —
                and that&apos;s the work we do at KnowMind.
              </blockquote>
              <div className="mt-6 flex items-center justify-center gap-3 md:justify-start">
                <span className="h-8 w-1 rounded-full bg-grad-accent" />
                <p className="text-left">
                  <span className="block font-semibold text-white">Kaleeswaran</span>
                  <span className="block text-sm text-purple-200">Founder, KnowMind Universe</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <Card tone="hero" className="text-center space-y-6 px-6 py-14 md:px-12">
          <h3 className="text-3xl md:text-4xl font-bold text-white font-display">
            Ready to understand yourself better?
          </h3>
          <p className="text-lg text-purple-100 max-w-2xl mx-auto leading-relaxed">
            Take the assessment in about 10 minutes and get your personalized emotional
            intelligence profile.
          </p>
          <div className="flex justify-center pt-2">
            <Link href="/assessment" className="inline-flex">
              <Button variant="primary" className="h-[52px] px-10 text-base">Start your assessment</Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-purple-900 text-purple-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <img src="/logo-white.png" alt="KnowMind Universe" className="h-9 w-auto" />
              <div className="leading-tight">
                <p className="text-lg font-bold text-white font-display">KnowMind Universe</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-purple-300">Training · Coaching · Therapy</p>
              </div>
            </div>
            <p className="text-sm text-purple-300 max-w-xs">
              Emotional intelligence assessment and development, grounded in psychology and
              experiential learning.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-semibold text-white">Get in touch</p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
              <a href="tel:+919688440032" className="hover:text-white">+91 96884 40032</a>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
              <a href="mailto:kaleesemail@gmail.com" className="hover:text-white">kaleesemail@gmail.com</a>
            </p>
            <p className="flex items-center gap-2">
              <Globe className="h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
              <a href="https://www.kaleeswaran.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">www.kaleeswaran.com</a>
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-semibold text-white">Visit us</p>
            <p className="text-purple-300">
              2nd Floor, Imayam Towers,<br />
              Sadasiva Nagar, Madipakkam,<br />
              Chennai, Tamil Nadu
            </p>
            <div className="flex gap-3 pt-1">
              <a href="https://www.linkedin.com/in/kaleeswaran-kamaraj-93102299/" target="_blank" rel="noopener noreferrer" className="hover:text-white">LinkedIn</a>
              <a href="https://www.instagram.com/kalee_therapist_trainer" target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram</a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-center text-xs text-purple-400">
            © 2026 KnowMind Universe. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
