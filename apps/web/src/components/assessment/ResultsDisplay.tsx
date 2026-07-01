'use client'

import DomainRadar from './DomainRadar'
import DomainBars from './DomainBars'
import { Button, Card, Pill } from '@/components/ui'
import { Printer, Phone, Mail, Globe, Sparkles, ArrowUpRight } from 'lucide-react'

type BandKey = 'developing' | 'emerging' | 'strong'

interface Scores {
  overall: number
  domainScores: Record<string, number>
  personalCompetence: number
  socialCompetence: number
  band: string
}

interface ResultsDisplayProps {
  results: Scores
}

// Enrichment: what each domain measures + a growth prompt, so the report reads
// as guidance rather than just numbers.
const DOMAIN_META: Record<
  number,
  { name: string; blurb: string; tip: string }
> = {
  1: {
    name: 'Self-Awareness',
    blurb: 'Recognising your emotions as they happen and understanding their impact.',
    tip: 'Name what you feel in the moment before you react to it.',
  },
  2: {
    name: 'Self-Regulation',
    blurb: 'Managing impulses and staying composed when pressure is high.',
    tip: 'Build a pause between trigger and response — even a few breaths.',
  },
  3: {
    name: 'Motivation',
    blurb: 'Your inner drive, optimism and commitment to meaningful goals.',
    tip: 'Reconnect daily tasks to the bigger “why” behind them.',
  },
  4: {
    name: 'Empathy',
    blurb: 'Sensing and understanding what others feel and need.',
    tip: 'Listen to understand, not to reply — reflect back what you hear.',
  },
  5: {
    name: 'Social & Leadership',
    blurb: 'Influencing, inspiring and guiding people toward shared outcomes.',
    tip: 'Give specific, timely feedback and celebrate others’ wins.',
  },
  6: {
    name: 'Relationship Intelligence',
    blurb: 'Building and sustaining trust and genuine connection over time.',
    tip: 'Invest in relationships before you need them.',
  },
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const domains = Object.entries(DOMAIN_META).map(([id, m]) => ({
    id: Number(id),
    name: m.name,
  }))

  const sortedDomains = [...domains].sort(
    (a, b) => (results.domainScores[b.id] || 0) - (results.domainScores[a.id] || 0)
  )
  const strength = sortedDomains[0]
  const growth = sortedDomains[sortedDomains.length - 1]

  const getBand = (score: number): BandKey =>
    score >= 4.0 ? 'strong' : score >= 3.0 ? 'emerging' : 'developing'
  const getBandLabel = (score: number) =>
    score >= 4.0 ? 'Strong' : score >= 3.0 ? 'Emerging' : 'Developing'

  const bandSummary =
    results.overall >= 4.0
      ? 'You show strong, consistent emotional intelligence. Keep applying it deliberately to raise the people around you.'
      : results.overall >= 3.0
      ? 'You have a solid EI foundation with clear, reachable room to grow. Small, focused habits will move your score meaningfully.'
      : 'You’re early in your EI journey — and that’s useful to know. Targeted practice in a couple of domains will create quick, visible gains.'

  return (
    <div className="min-h-screen bg-cream py-8 px-4 sm:px-6 lg:px-8 print:py-0">
      <div className="max-w-5xl mx-auto animate-fade-in-up space-y-5">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-purple-800">
            Your Emotional Intelligence Profile
          </h1>
          <p className="mt-1 text-ink-500">A snapshot across the six EI domains</p>
        </div>

        {/* Top strip: overall + competence split, compact */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr_1fr] gap-4">
          <Card tone="hero" className="flex flex-col justify-center !py-6">
            <p className="text-white/80 uppercase tracking-wide text-xs font-semibold">
              Overall EI Score
            </p>
            <div className="flex items-end gap-3 mt-1">
              <span className="text-5xl font-display font-bold leading-none">
                {results.overall.toFixed(2)}
              </span>
              <span className="text-white/60 text-lg mb-1">/ 5.00</span>
            </div>
            <div className="mt-3">
              <Pill band={getBand(results.overall)}>{getBandLabel(results.overall)}</Pill>
            </div>
            <p className="mt-3 text-sm text-white/85 leading-relaxed">{bandSummary}</p>
          </Card>

          <Card tone="accent" className="text-center flex flex-col justify-center !py-6">
            <div className="text-4xl font-display font-bold">
              {results.personalCompetence.toFixed(2)}
            </div>
            <p className="font-semibold mt-1">Personal Competence</p>
            <p className="text-xs text-purple-900/70 mt-1.5 leading-snug">
              Self-Awareness · Self-Regulation · Motivation
            </p>
          </Card>

          <Card tone="lavender" className="text-center flex flex-col justify-center !py-6">
            <div className="text-4xl font-display font-bold text-purple-800">
              {results.socialCompetence.toFixed(2)}
            </div>
            <p className="font-semibold text-purple-800 mt-1">Social Competence</p>
            <p className="text-xs text-ink-500 mt-1.5 leading-snug">
              Empathy · Social &amp; Leadership · Relationships
            </p>
          </Card>
        </div>

        {/* Radar + Bars side by side to save vertical space */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card tone="base" className="!py-5">
            <h2 className="text-lg font-display font-bold text-purple-800 mb-3">Domain Radar</h2>
            <div className="flex justify-center">
              <DomainRadar scores={results.domainScores} domains={domains} />
            </div>
          </Card>
          <Card tone="base" className="!py-5">
            <h2 className="text-lg font-display font-bold text-purple-800 mb-3">Domain Breakdown</h2>
            <DomainBars scores={results.domainScores} domains={domains} />
          </Card>
        </div>

        {/* Enriched per-domain read-out */}
        <Card tone="base" className="!py-5">
          <h2 className="text-lg font-display font-bold text-purple-800 mb-4">
            What each domain means for you
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {sortedDomains.map((d) => {
              const score = results.domainScores[d.id] || 0
              const meta = DOMAIN_META[d.id]
              return (
                <div key={d.id} className="flex gap-3">
                  <div className="flex-shrink-0 text-center">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl font-display font-bold ${
                        getBand(score) === 'strong'
                          ? 'bg-success-soft text-success'
                          : getBand(score) === 'emerging'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-gold-100 text-gold-600'
                      }`}
                    >
                      {score.toFixed(1)}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink-700 text-sm">{meta.name}</p>
                      <Pill band={getBand(score)}>{getBandLabel(score)}</Pill>
                    </div>
                    <p className="text-xs text-ink-500 mt-0.5 leading-snug">{meta.blurb}</p>
                    <p className="text-xs text-purple-700 mt-1 leading-snug">
                      <span className="font-semibold">Grow:</span> {meta.tip}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Strength & Growth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card tone="base" className="border-l-4 border-success !py-5">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-display font-bold text-ink-700">Primary Strength</h3>
              <Pill band="strong">Lean in</Pill>
            </div>
            <p className="font-semibold text-ink-700">
              {strength.name}{' '}
              <span className="text-success">
                {results.domainScores[strength.id].toFixed(2)}
              </span>
            </p>
            <p className="text-sm text-ink-500 mt-1.5 leading-snug">
              Your strongest domain — a natural asset in your leadership and relationships.{' '}
              {DOMAIN_META[strength.id].tip}
            </p>
          </Card>

          <Card tone="base" className="border-l-4 border-gold-400 !py-5">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-display font-bold text-ink-700">Growth Edge</h3>
              <Pill band="developing">Focus here</Pill>
            </div>
            <p className="font-semibold text-ink-700">
              {growth.name}{' '}
              <span className="text-gold-600">
                {results.domainScores[growth.id].toFixed(2)}
              </span>
            </p>
            <p className="text-sm text-ink-500 mt-1.5 leading-snug">
              Your biggest opportunity — small gains here lift your overall EI fastest.{' '}
              {DOMAIN_META[growth.id].tip}
            </p>
          </Card>
        </div>

        {/* Reference note + contact Kaleeswaran */}
        <Card tone="hero" className="!py-6">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gold-300">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                For reference only
              </div>
              <h3 className="mt-3 text-xl font-display font-bold text-white">
                This is a self-reflection snapshot — not a diagnosis.
              </h3>
              <p className="mt-2 text-sm text-white/85 leading-relaxed max-w-xl">
                For an accurate interpretation and a structured, personalised growth plan, we
                strongly recommend a debrief with <span className="font-semibold text-white">Mr.
                Kaleeswaran</span>, Founder of KnowMind Universe. He can turn these scores into a
                practical roadmap for you or your team.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/90">
                <a href="tel:+919688440032" className="inline-flex items-center gap-2 hover:text-white">
                  <Phone className="h-4 w-4 text-gold-300" strokeWidth={2} aria-hidden="true" />
                  +91 96884 40032
                </a>
                <a href="mailto:kaleesemail@gmail.com" className="inline-flex items-center gap-2 hover:text-white">
                  <Mail className="h-4 w-4 text-gold-300" strokeWidth={2} aria-hidden="true" />
                  kaleesemail@gmail.com
                </a>
                <a
                  href="https://www.kaleeswaran.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-white"
                >
                  <Globe className="h-4 w-4 text-gold-300" strokeWidth={2} aria-hidden="true" />
                  www.kaleeswaran.com
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:w-52 print:hidden">
              <a
                href="mailto:kaleesemail@gmail.com?subject=EI%20Report%20Debrief%20Request"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md bg-gold-400 text-purple-900 font-semibold text-[15px] hover:bg-gold-300 transition-colors"
              >
                Book a debrief
                <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </a>
              <Button variant="ghost" onClick={() => window.print()} className="!text-white hover:!bg-white/10">
                <Printer className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                Print / Save
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
