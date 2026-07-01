'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { Search, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button, Card, Input } from '@/components/ui'
import { scoreSubmission } from '@/lib/scoring'
import ResultsDisplay from '@/components/assessment/ResultsDisplay'

interface Scores {
  overall: number
  domainScores: Record<string, number>
  personalCompetence: number
  socialCompetence: number
  band: string
}

// Turn a persisted submission (with or without raw answers) into the Scores
// shape ResultsDisplay expects. Prefer re-scoring the raw answers so the numbers
// exactly match what the person originally saw.
function buildScores(data: any): Scores | null {
  if (Array.isArray(data.rawAnswers) && data.rawAnswers.length > 0) {
    const s = scoreSubmission(data.rawAnswers)
    return {
      overall: s.overall,
      domainScores: s.domainScores as Record<string, number>,
      personalCompetence: s.personalCompetence,
      socialCompetence: s.socialCompetence,
      band: s.band,
    }
  }

  const f = data.fallback || {}
  if (f.overall == null || !f.domainScores) return null

  const scores: Record<string, number> = f.domainScores
  const avg = (ids: number[]) =>
    ids.reduce((sum, id) => sum + (Number(scores[id]) || 0), 0) / ids.length

  return {
    overall: Number(f.overall),
    domainScores: scores,
    personalCompetence: f.personalCompetence != null ? Number(f.personalCompetence) : avg([1, 2, 3]),
    socialCompetence: f.socialCompetence != null ? Number(f.socialCompetence) : avg([4, 5, 6]),
    band: '',
  }
}

export default function ResultsLookupPage() {
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<Scores | null>(null)

  async function handleLookup(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/my-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Lookup failed. Please try again.')
        return
      }
      const scores = buildScores(data)
      if (!scores) {
        setError('We found your record but couldn’t rebuild the scores. Please retake the assessment.')
        return
      }
      setResults(scores)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (results) {
    return <ResultsDisplay results={results} />
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <Link
          href="/landing"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-purple-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>

        <Card tone="base" className="space-y-5">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600">
              <Search className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-display font-bold text-purple-800">
              Get your previous results
            </h1>
            <p className="mt-1.5 text-sm text-ink-500">
              Enter the email or phone number you used, and we’ll pull up your latest
              Emotional Intelligence profile.
            </p>
          </div>

          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-700">
                Email or phone number
              </label>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="you@example.com or 9688440032"
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="rounded-md border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" disabled={loading} className="w-full">
              {loading ? 'Looking up…' : 'View my results'}
              {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </Button>
          </form>

          <p className="text-center text-sm text-ink-500">
            Haven’t taken it yet?{' '}
            <Link href="/assessment" className="font-semibold text-purple-700 hover:underline">
              Start the assessment
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
