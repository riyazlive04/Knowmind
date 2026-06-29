'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DomainRadar from '@/components/assessment/DomainRadar'
import DomainBars from '@/components/assessment/DomainBars'

interface Member {
  id: string
  name: string
  phone?: string
  location?: string
  business?: string
  gender?: string
  marital_status?: string
  notes?: string
  created_at: string
  updated_at: string
}

interface Submission {
  id: string
  member_id: string
  round: string
  overall: number
  domain_scores: Record<string, number>
  personal_competence: number
  social_competence: number
  free_text?: Record<string, string>
  created_at: string
}

export default function MemberProfilePage() {
  const params = useParams()
  const memberId = params.id as string
  const router = useRouter()

  const [member, setMember] = useState<Member | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    business: '',
    gender: '',
    marital_status: '',
    notes: '',
  })

  useEffect(() => {
    loadMember()
  }, [memberId])

  const loadMember = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/members-operations?id=${memberId}`)
      const data = await response.json()

      if (response.ok) {
        setMember(data.member)
        setSubmissions(data.submissions || [])
        setFormData({
          name: data.member.name || '',
          phone: data.member.phone || '',
          location: data.member.location || '',
          business: data.member.business || '',
          gender: data.member.gender || '',
          marital_status: data.member.marital_status || '',
          notes: data.member.notes || '',
        })
        setError(null)
      } else {
        setError('Member not found')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/members-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: memberId,
          ...formData,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMember(data.member)
        setEditing(false)
      } else {
        setError('Failed to save member')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4">
        <p className="text-center text-text-muted">Loading member profile...</p>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-error mb-4">Member not found</p>
          <button
            onClick={() => router.back()}
            className="block mx-auto px-6 py-3 bg-primary text-primary-fg rounded-lg hover:bg-primary-hover"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const latestSubmission = submissions[0]
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
    if (score >= 3.0) return 'text-amber-600'
    return 'text-error'
  }

  const getBandLabel = (score: number) => {
    if (score >= 4.0) return 'High'
    if (score >= 3.0) return 'Moderate'
    return 'Needs Support'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="text-primary hover:text-primary-hover text-sm font-medium mb-2"
            >
              ← Back to Members
            </button>
            <h1 className="text-4xl font-bold text-primary font-fraunces">{member.name}</h1>
          </div>
          <button
            onClick={() => (editing ? handleSave() : setEditing(true))}
            className="px-6 py-3 bg-primary text-primary-fg font-medium rounded-lg hover:bg-primary-hover"
          >
            {editing ? 'Save' : 'Edit Member'}
          </button>
        </div>

        {error && (
          <div className="bg-error/10 border border-error rounded-lg p-4 mb-8">
            <p className="text-error">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-lg shadow-lg p-6 border border-border">
              <h2 className="text-xl font-bold text-primary mb-6 font-fraunces">Member Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="font-medium">{member.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Phone</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p>{member.phone || '—'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Location</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p>{member.location || '—'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Business</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.business}
                      onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p>{member.business || '—'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Gender</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p>{member.gender || '—'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Marital Status</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.marital_status}
                      onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p>{member.marital_status || '—'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Notes</label>
                  {editing ? (
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-sm text-text-muted">{member.notes || 'No notes'}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-lg shadow-lg p-6 border border-border mt-8 opacity-50">
              <h3 className="text-lg font-bold text-primary mb-4 font-fraunces">Lead Status</h3>
              <p className="text-sm text-text-muted">(Available in Phase 6)</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            {latestSubmission ? (
              <>
                <div className="bg-surface rounded-lg shadow-lg p-8 border border-border mb-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className={`text-5xl font-bold mb-2 font-fraunces ${getBandColor(latestSubmission.overall)}`}>
                        {latestSubmission.overall.toFixed(2)}
                      </div>
                      <p className="text-text-muted mb-2">Overall Score</p>
                      <p className={`text-lg font-semibold ${getBandColor(latestSubmission.overall)}`}>
                        {getBandLabel(latestSubmission.overall)}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="text-5xl font-bold text-amber-600 mb-2 font-fraunces">
                        {latestSubmission.personal_competence?.toFixed(2) || 'N/A'}
                      </div>
                      <p className="text-text-muted">Personal Competence</p>
                    </div>

                    <div className="text-center">
                      <div className="text-5xl font-bold text-violet-600 mb-2 font-fraunces">
                        {latestSubmission.social_competence?.toFixed(2) || 'N/A'}
                      </div>
                      <p className="text-text-muted">Social Competence</p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface rounded-lg shadow-lg p-8 border border-border mb-8">
                  <h3 className="text-2xl font-bold text-primary mb-6 font-fraunces">Domain Radar</h3>
                  <div className="flex justify-center">
                    <DomainRadar scores={latestSubmission.domain_scores} domains={domains} />
                  </div>
                </div>

                <div className="bg-surface rounded-lg shadow-lg p-8 border border-border mb-8">
                  <h3 className="text-2xl font-bold text-primary mb-6 font-fraunces">Domain Scores</h3>
                  <DomainBars scores={latestSubmission.domain_scores} domains={domains} />
                </div>

                {latestSubmission.free_text && Object.keys(latestSubmission.free_text).length > 0 && (
                  <div className="bg-surface rounded-lg shadow-lg p-8 border border-border mb-8">
                    <h3 className="text-2xl font-bold text-primary mb-6 font-fraunces">Free-Text Responses</h3>
                    <div className="space-y-6">
                      {Object.entries(latestSubmission.free_text).map(([key, value]) => (
                        <div key={key}>
                          <h4 className="font-semibold text-primary mb-2">{key}</h4>
                          <p className="text-text-muted bg-gray-50 rounded p-4">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {submissions.length > 1 && (
                  <div className="bg-surface rounded-lg shadow-lg p-8 border border-border">
                    <h3 className="text-2xl font-bold text-primary mb-6 font-fraunces">Submission History</h3>
                    <div className="space-y-4">
                      {submissions.map((sub) => (
                        <div key={sub.id} className="border-b border-border pb-4 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-text">{sub.round.charAt(0).toUpperCase() + sub.round.slice(1)}</span>
                            <span className="text-sm text-text-muted">{new Date(sub.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm">Score: <span className="font-semibold">{sub.overall.toFixed(2)}</span></p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-surface rounded-lg shadow-lg p-8 border border-border text-center">
                <p className="text-text-muted">No assessment submissions yet</p>
              </div>
            )}

            <div className="bg-surface rounded-lg shadow-lg p-8 border border-border mt-8 opacity-50">
              <h3 className="text-lg font-bold text-primary mb-4 font-fraunces">Reports</h3>
              <p className="text-sm text-text-muted">(Available in Phase 6)</p>
            </div>

            <div className="bg-surface rounded-lg shadow-lg p-8 border border-border mt-8 opacity-50">
              <h3 className="text-lg font-bold text-primary mb-4 font-fraunces">Delivery History</h3>
              <p className="text-sm text-text-muted">(Available in Phase 7)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
