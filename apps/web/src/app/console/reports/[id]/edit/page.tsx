'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReportTemplate from '@/components/report/ReportTemplate'
import { Lock, Save, CheckCircle, AlertCircle, Download, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'

interface Report {
  id: string
  member_id: string
  submission_id: string
  state: string
  personal_note: string
  what_you_shared: string
  action_plan: string
  created_at: string
  updated_at: string
}

interface Member {
  id: string
  name: string
  phone?: string
  location?: string
  business?: string
}

interface Submission {
  overall: number
  domain_scores: Record<string, number>
  personal_competence: number
  social_competence: number
}

const STATES = ['Draft', 'Edited', 'Approved', 'Sent', 'Hold', 'Failed']
const STATE_COLORS: Record<string, string> = {
  Draft: 'bg-ink-100 text-ink-700',
  Edited: 'bg-info-soft text-info',
  Approved: 'bg-success-soft text-success',
  Sent: 'bg-purple-100 text-purple-700',
  Hold: 'bg-warning-soft text-warning',
  Failed: 'bg-danger-soft text-danger',
}

export default function ReportEditorPage() {
  const params = useParams()
  const reportId = params.id as string
  const router = useRouter()

  const [report, setReport] = useState<Report | null>(null)
  const [member, setMember] = useState<Member | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [approving, setApproving] = useState(false)

  const [personalNote, setPersonalNote] = useState('')
  const [whatYouShared, setWhatYouShared] = useState('')
  const [actionPlan, setActionPlan] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [changedFields, setChangedFields] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadReport()
  }, [reportId])

  const loadReport = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports?reportId=${reportId}`)

      if (!response.ok) {
        throw new Error('Report not found')
      }

      const data = await response.json()

      setReport(data.report)
      setMember(data.member)
      setSubmission(data.submission)
      setPersonalNote(data.report.personal_note || '')
      setWhatYouShared(data.report.what_you_shared || '')
      setActionPlan(data.report.action_plan || '')
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (field: 'personal_note' | 'what_you_shared' | 'action_plan', value: string) => {
    setIsDirty(true)
    setChangedFields({ ...changedFields, [field]: true })

    if (field === 'personal_note') setPersonalNote(value)
    else if (field === 'what_you_shared') setWhatYouShared(value)
    else if (field === 'action_plan') setActionPlan(value)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/reports/${reportId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalNote,
          whatYouShared,
          actionPlan,
          changedFields,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save report')
      }

      const data = await response.json()
      setReport({ ...report, ...data.report, state: 'Edited' } as Report)
      setIsDirty(false)
      setChangedFields({})
      alert('Report saved successfully')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async () => {
    if (!window.confirm('Approve this report? It will be locked from further editing.')) {
      return
    }

    try {
      setApproving(true)
      setError(null)

      const response = await fetch(`/api/reports/${reportId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Failed to approve report')
      }

      const data = await response.json()
      setReport({ ...report, state: 'Approved' } as Report)
      alert('Report approved and locked')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setApproving(false)
    }
  }

  const handleDownloadPDF = () => {
    // Open print dialog for PDF download
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream py-12 px-4">
        <p className="text-center text-ink-500">Loading report...</p>
      </div>
    )
  }

  if (!report || !member || !submission) {
    return (
      <div className="min-h-screen bg-cream py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-error mb-4">{error || 'Report not found'}</p>
          <div className="flex justify-center">
            <Button onClick={() => router.push('/console/reports')} variant="purple">
              Back to Reports
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isLocked = report.state === 'Approved' || report.state === 'Sent'
  const domains = [
    { id: 1, name: 'Self-Awareness' },
    { id: 2, name: 'Self-Regulation' },
    { id: 3, name: 'Motivation' },
    { id: 4, name: 'Empathy' },
    { id: 5, name: 'Social & Leadership' },
    { id: 6, name: 'Relationship Intelligence' },
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4 animate-fade-in-up">
            <div>
              <button
                onClick={() => router.push('/console/reports')}
                className="inline-flex items-center gap-1.5 text-primary hover:text-primary-hover text-sm font-medium mb-2"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                Back to Reports
              </button>
              <h1 className="text-3xl font-bold text-primary font-fraunces">{member.name}</h1>
            </div>
            <span className={`px-4 py-2 rounded-full font-semibold text-sm ${STATE_COLORS[report.state] || STATE_COLORS.Draft}`}>
              {report.state}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleSave}
              disabled={!isDirty || saving || isLocked}
              variant="primary"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>

            <button
              onClick={handleApprove}
              disabled={report.state === 'Sent' || report.state === 'Approved' || approving}
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md font-sans font-semibold text-[15px] bg-success text-white transition-all duration-150 hover:opacity-90 disabled:bg-ink-200 disabled:text-ink-400 disabled:cursor-not-allowed"
            >
              <CheckCircle size={18} />
              {approving ? 'Approving...' : 'Approve'}
            </button>

            <Button
              onClick={handleDownloadPDF}
              variant="purple"
            >
              <Download size={18} />
              Download PDF
            </Button>

            {isLocked && (
              <div className="flex items-center gap-2 text-ink-500">
                <Lock size={18} />
                <span className="text-sm">Locked from editing</span>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 bg-error/10 border border-error rounded-lg p-3">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          {isDirty && (
            <div className="mt-4 bg-info-soft border border-info/30 rounded-lg p-3">
              <p className="text-info text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                You have unsaved changes
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Split View: Editor + Preview */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6 lg:p-8">
          {/* Left: Editor Form */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary font-fraunces mb-6">Edit Narrative</h2>

            {/* Personal Note */}
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Personal Note from Kaleeswaran</label>
              <textarea
                value={personalNote}
                onChange={(e) => handleFieldChange('personal_note', e.target.value)}
                disabled={isLocked}
                rows={6}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-ink-100 disabled:cursor-not-allowed"
                placeholder="Dear [name],...[signature]"
              />
            </div>

            {/* What You Shared */}
            <div>
              <label className="block text-sm font-semibold text-text mb-2">What You Shared - Heard & Acknowledged</label>
              <textarea
                value={whatYouShared}
                onChange={(e) => handleFieldChange('what_you_shared', e.target.value)}
                disabled={isLocked}
                rows={4}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-ink-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Action Plan */}
            <div>
              <label className="block text-sm font-semibold text-text mb-2">Your Personalised Action Plan</label>
              <textarea
                value={actionPlan}
                onChange={(e) => handleFieldChange('action_plan', e.target.value)}
                disabled={isLocked}
                rows={6}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-ink-100 disabled:cursor-not-allowed"
                placeholder="21-day plan..."
              />
            </div>

            {/* Read-Only Scores Section */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-primary mb-4 font-fraunces">Scores (Read-Only)</h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-text-muted">Overall Score</p>
                  <p className="text-3xl font-bold text-primary">{submission.overall.toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-sm text-text-muted">Primary Strength</p>
                  <p className="font-semibold text-text">
                    {(() => {
                      const entries = Object.entries(submission.domain_scores || {}) as [string, number][]
                      if (entries.length === 0) return '—'
                      return entries.reduce((best, cur) => (cur[1] > best[1] ? cur : best))[0]
                    })()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-text-muted">Growth Opportunity</p>
                  <p className="font-semibold text-text">
                    {(() => {
                      const entries = Object.entries(submission.domain_scores || {}) as [string, number][]
                      if (entries.length === 0) return '—'
                      return entries.reduce((worst, cur) => (cur[1] < worst[1] ? cur : worst))[0]
                    })()}
                  </p>
                </div>
              </div>

              <p className="text-xs text-text-muted mt-4 p-3 bg-purple-50 rounded">
                Scores are computed from assessment data and cannot be edited here. They reflect the member's actual EI assessment results.
              </p>
            </div>
          </div>

          {/* Right: Live PDF Preview */}
          <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
            <h2 className="text-2xl font-bold text-primary font-fraunces mb-6">Preview</h2>
            <div className="bg-white rounded-lg shadow-lg border border-border p-6 print:p-0 print:bg-white print:shadow-none">
              <ReportTemplate
                member={member}
                submission={submission}
                report={{
                  personal_note: personalNote,
                  what_you_shared: whatYouShared,
                  action_plan: actionPlan,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; margin: 0; padding: 0; }
          .grid { display: block !important; }
          h2:first-of-type { display: none; }
        }
      `}</style>
    </div>
  )
}
