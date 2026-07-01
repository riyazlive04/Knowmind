'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DomainRadar from '@/components/assessment/DomainRadar'
import DomainBars from '@/components/assessment/DomainBars'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'

interface Submission {
  id: string
  member_id: string
  round: string
  overall: number
  domain_scores: Record<string, number>
  personal_competence: number
  social_competence: number
  free_text?: Record<string, string>
  raw_answers?: any
  created_at: string
}

interface Member {
  id: string
  name: string
  phone?: string
  location?: string
  business?: string
}

export default function SubmissionDetailPage() {
  const params = useParams()
  const submissionId = params.id as string
  const router = useRouter()

  const [submission, setSubmission] = useState<Submission | null>(null)
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSubmission()
  }, [submissionId])

  const loadSubmission = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/submissions?id=${submissionId}`)
      const data = await response.json()

      if (response.ok) {
        setSubmission(data.submission)
        setMember(data.member)
        setError(null)
      } else {
        setError('Submission not found')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4">
        <p className="text-center text-text-muted">Loading submission...</p>
      </div>
    )
  }

  if (!submission || !member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-error mb-4">{error || 'Submission not found'}</p>
          <div className="flex justify-center">
            <Button onClick={() => router.back()} variant="purple">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const domains = [
    { id: 1, name: 'Self-Awareness' },
    { id: 2, name: 'Self-Regulation' },
    { id: 3, name: 'Motivation' },
    { id: 4, name: 'Empathy' },
    { id: 5, name: 'Social & Leadership' },
    { id: 6, name: 'Relationship Intelligence' },
  ]

  const getBandColor = (score: number) => {
    if (score >= 4.0) return 'text-success'
    if (score >= 3.0) return 'text-purple-600'
    return 'text-gold-600'
  }

  const getBandLabel = (score: number) => {
    if (score >= 4.0) return 'High'
    if (score >= 3.0) return 'Moderate'
    return 'Needs Support'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in-up">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-primary hover:text-primary-hover text-sm font-medium mb-2"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Back to Submissions
          </button>
          <h1 className="text-4xl font-display font-bold text-primary">{member.name}</h1>
          <p className="text-text-muted">
            {submission.round.charAt(0).toUpperCase() + submission.round.slice(1)} Assessment •{' '}
            {new Date(submission.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Overall Score Card */}
        <div className="bg-surface rounded-lg shadow-lg p-8 border border-border mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className={`text-5xl font-bold mb-2 font-display ${getBandColor(submission.overall)}`}>
                {submission.overall.toFixed(2)}
              </div>
              <p className="text-text-muted mb-2">Overall Score</p>
              <p className={`text-lg font-semibold ${getBandColor(submission.overall)}`}>
                {getBandLabel(submission.overall)}
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold text-gold-600 mb-2 font-display">
                {submission.personal_competence?.toFixed(2) || 'N/A'}
              </div>
              <p className="text-text-muted">Personal Competence</p>
              <p className="text-xs text-text-muted mt-2">Self-Awareness + Self-Regulation + Motivation</p>
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold text-purple-600 mb-2 font-display">
                {submission.social_competence?.toFixed(2) || 'N/A'}
              </div>
              <p className="text-text-muted">Social Competence</p>
              <p className="text-xs text-text-muted mt-2">Empathy + Social & Leadership + Relationships</p>
            </div>
          </div>
        </div>

        {/* Hexagon Radar */}
        <div className="bg-surface rounded-lg shadow-lg p-8 border border-border mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6 font-fraunces">Domain Radar</h2>
          <div className="flex justify-center">
            <DomainRadar scores={submission.domain_scores} domains={domains} />
          </div>
        </div>

        {/* Domain Bars */}
        <div className="bg-surface rounded-lg shadow-lg p-8 border border-border mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6 font-fraunces">Domain Scores</h2>
          <DomainBars scores={submission.domain_scores} domains={domains} />
        </div>

        {/* Free-Text Responses */}
        {submission.free_text && Object.keys(submission.free_text).length > 0 && (
          <div className="bg-surface rounded-lg shadow-lg p-8 border border-border mb-8">
            <h2 className="text-2xl font-bold text-primary mb-6 font-fraunces">Free-Text Responses</h2>
            <div className="space-y-6">
              {Object.entries(submission.free_text).map(([key, value]) => (
                <div key={key}>
                  <h3 className="font-semibold text-primary mb-2">{key}</h3>
                  <p className="text-text-muted bg-purple-50 rounded p-4 whitespace-pre-wrap">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Item-Level Responses (if raw_answers exists) */}
        {submission.raw_answers && Object.keys(submission.raw_answers).length > 0 && (
          <div className="bg-surface rounded-lg shadow-lg p-8 border border-border">
            <h2 className="text-2xl font-bold text-primary mb-6 font-fraunces">Item-Level Responses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(submission.raw_answers).map(([key, value]) => (
                <div key={key} className="bg-purple-50 rounded p-4">
                  <p className="text-xs text-text-muted mb-1">Item {key}</p>
                  <p className="font-semibold text-text">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Read-Only Notice */}
        <div className="text-center mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-text-muted">This is a read-only view. Scores and responses cannot be modified.</p>
        </div>
      </div>
    </div>
  )
}
