'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { scoreSubmission } from '@/lib/scoring'
import AssessmentForm from '@/components/assessment/AssessmentForm'
import ResultsDisplay from '@/components/assessment/ResultsDisplay'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

        if (queryError) throw queryError
        if (!data || data.length === 0) throw new Error('No published question version found')

        setQuestionVersion(data[0])
      } catch (err: any) {
        setError(err.message || 'Failed to load assessment')
      } finally {
        setLoading(false)
      }
    }

    loadQuestions()
  }, [])

  const handleSubmit = async (rawAnswers: number[], freeText: Record<string, string>) => {
    try {
      setLoading(true)
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

      // Insert submission directly to Supabase (anon insert access via RLS)
      const { data: submission, error: subError } = await supabase
        .from('submission')
        .insert([
          {
            round: 'pre',
            question_version_id: questionVersion.id,
            raw_answers: rawAnswers,
            domain_scores: scores.domainScores,
            overall: scores.overall,
            personal_competence: scores.personalCompetence,
            social_competence: scores.socialCompetence,
            free_text: freeText,
          },
        ])
        .select()

      if (subError) throw subError
      if (!submission || submission.length === 0) throw new Error('Failed to create submission')

      setResults({
        submission: submission[0],
        scores,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to submit assessment')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-text-muted">{error}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-text-muted">Loading assessment...</p>
        </div>
      </div>
    )
  }

  if (results) {
    return <ResultsDisplay results={results.scores} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-3 font-fraunces">
            Emotional Intelligence Assessment
          </h1>
          <p className="text-lg text-text-muted">
            Discover your EI strengths and growth areas across 6 key domains
          </p>
        </div>

        {questionVersion && (
          <AssessmentForm
            questionVersion={questionVersion}
            onSubmit={handleSubmit}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  )
}
