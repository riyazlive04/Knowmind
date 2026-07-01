'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { scoreSubmission } from '@/lib/scoring'
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
        const supabase = createClient()

        // Query Supabase directly for published questions (anon read access via RLS)
        const { data, error: queryError } = await supabase
          .from('question_version')
          .select('*')
          .eq('status', 'published')
          .order('version_no', { ascending: false })
          .limit(1)

        console.log('Question fetch result:', { data, queryError })

        if (queryError) {
          console.error('Supabase RLS/query error:', queryError)
          throw queryError
        }
        if (!data || data.length === 0) {
          console.error('No published questions found. Data:', data)
          throw new Error('No published question version found')
        }

        console.log('Loaded question version:', data[0])
        setQuestionVersion(data[0])
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
      const supabase = createClient()

      // Get latest published questions
      const { data: qvData, error: qvError } = await supabase
        .from('question_version')
        .select('*')
        .eq('status', 'published')
        .order('version_no', { ascending: false })
        .limit(1)

      if (qvError) throw qvError
      if (!qvData || qvData.length === 0) throw new Error('No published question version found')

      const questionVersion = qvData[0]

      // Score locally
      const scores = scoreSubmission(rawAnswers)

      // Build submission payload - only include columns that exist
      const submissionPayload = {
        round: 'pre',
        question_version_id: questionVersion.id,
        raw_answers: rawAnswers,
        domain_scores: scores.domainScores,
        overall: scores.overall,
        free_text: freeText,
        // Link to the member captured at the lead gate (anon can SELECT member
        // for FK verification; member was created server-side via /api/lead).
        ...(memberId && { member_id: memberId }),
        // Add competence columns - will be ignored if columns don't exist
        ...(scores.personalCompetence !== undefined && { personal_competence: scores.personalCompetence }),
        ...(scores.socialCompetence !== undefined && { social_competence: scores.socialCompetence }),
      }

      console.log('Submitting payload:', submissionPayload)

      // Insert submission directly to Supabase (anon insert access via RLS)
      // Do NOT use .select() - anon cannot SELECT submissions, only INSERT them
      const { error: subError } = await supabase
        .from('submission')
        .insert([submissionPayload])

      console.log('Submission insert response:', { error: subError })

      if (subError) {
        console.error('SUBMIT ERROR:', JSON.stringify(subError, null, 2))
        console.error('error.code:', subError.code)
        console.error('error.message:', subError.message)
        console.error('error.details:', subError.details)
        console.error('error.hint:', subError.hint)
        throw subError
      }

      console.log('Success! Submission inserted')
      setResults({
        submission: submissionPayload,
        scores,
      })
    } catch (err: any) {
      console.error('SUBMIT ERROR:', JSON.stringify(err, null, 2))
      console.error('error.code:', err.code)
      console.error('error.message:', err.message)
      console.error('error.details:', err.details)
      console.error('error.hint:', err.hint)
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
