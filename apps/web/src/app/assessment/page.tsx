'use client'

import { useEffect, useState } from 'react'
import AssessmentForm from '@/components/assessment/AssessmentForm'
import ResultsDisplay from '@/components/assessment/ResultsDisplay'
import LeadCaptureForm, { LeadDetails } from '@/components/assessment/LeadCaptureForm'

interface QuestionVersion {
  id: string
  items: any[]
}

interface Scores {
  overall: number
  domainScores: Record<string, number>
  personalCompetence: number
  socialCompetence: number
  band: string
}

export default function AssessmentPage() {
  const [questionVersion, setQuestionVersion] = useState<QuestionVersion | null>(null)
  const [results, setResults] = useState<{ submission: any; scores: Scores } | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // Lead captured at the gate before the questionnaire starts.
  const [memberId, setMemberId] = useState<string | null>(null)
  const [lead, setLead] = useState<LeadDetails | null>(null)

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        // Load published questions from the server (Prisma/Neon).
        const res = await fetch('/api/assessment')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load assessment')

        setQuestionVersion(data.questionVersion)
      } catch (err: any) {
        console.error('Assessment load error:', err)
        setError(err.message || 'Failed to load assessment')
      }
    }

    loadQuestions()
  }, [])

  const handleSubmit = async (rawAnswers: number[], freeText: Record<string, string>) => {
    try {
      setSubmitting(true)

      // Submit to the server: it scores, persists the submission (linked to the
      // member captured at the lead gate), and returns the computed scores.
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawAnswers, freeText, memberId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit assessment')

      setResults({
        submission: data.submission,
        scores: data.scores,
      })
    } catch (err: any) {
      console.error('SUBMIT ERROR:', err?.message, err)
      setError(err.message || 'Failed to submit assessment')
    } finally {
      setSubmitting(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-cream">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-danger mb-4">Error</h1>
          <p className="text-ink-500">{error}</p>
        </div>
      </div>
    )
  }

  if (results) {
    return <ResultsDisplay results={results.scores} />
  }

  return (
    <div className="min-h-screen bg-cream py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-display font-bold text-purple-800 mb-3">
            Emotional Intelligence Assessment
          </h1>
          <p className="text-lg text-ink-500">
            Discover your EI strengths and growth areas across 6 domains
          </p>
        </div>

        {/* Gate shows immediately; questions load in the background so there's
            no wait when arriving on the page. */}
        {!memberId ? (
          <LeadCaptureForm
            onSubmitted={(id, details) => {
              setMemberId(id)
              setLead(details)
            }}
          />
        ) : questionVersion ? (
          <>
            {lead && (
              <p className="mb-6 text-center text-sm text-ink-500">
                Welcome, <span className="font-semibold text-purple-700">{lead.name}</span> —
                answer all 27 statements to see your profile.
              </p>
            )}
            <AssessmentForm
              questionVersion={questionVersion}
              onSubmit={handleSubmit}
              isLoading={submitting}
            />
          </>
        ) : (
          <div className="py-16 text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600" />
            <p className="text-ink-500">Preparing your assessment…</p>
          </div>
        )}
      </div>
    </div>
  )
}
