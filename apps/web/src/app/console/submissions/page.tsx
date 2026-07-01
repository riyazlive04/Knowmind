'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, Download, ArrowUp, ArrowDown } from 'lucide-react'
import { Pill, Button, Input, Select } from '@/components/ui'
import { downloadSheet, type Column } from '@/lib/export/xlsx'

const SUBMISSION_EXPORT_COLUMNS: Column<Submission>[] = [
  { key: 'id', header: 'Submission ID' },
  { key: 'member_name', header: 'Member' },
  { key: 'round', header: 'Round' },
  { key: 'overall', header: 'Overall' },
  { key: 'ei_band', header: 'EI Band' },
  { key: 'created_at', header: 'Created At' },
]

const BAND_TO_PILL: Record<string, 'developing' | 'emerging' | 'strong' | 'pending'> = {
  High: 'strong',
  Moderate: 'emerging',
  'Needs Support': 'developing',
}

interface Submission {
  id: string
  member_id: string
  member_name: string
  round: string
  overall: number
  ei_band: string
  created_at: string
}

interface SubmissionsResponse {
  submissions: Submission[]
  total: number
  page: number
  pageSize: number
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roundFilter, setRoundFilter] = useState('')
  const [memberNameFilter, setMemberNameFilter] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const pageSize = 10
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadSubmissions()
  }, [roundFilter, memberNameFilter, sortBy, sortOrder, page])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('pageSize', pageSize.toString())
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)
      if (roundFilter) params.append('round', roundFilter)
      if (memberNameFilter) params.append('memberName', memberNameFilter)

      const response = await fetch(`/api/submissions?${params.toString()}`)
      const data: SubmissionsResponse = await response.json()

      setSubmissions(data.submissions || [])
      setTotal(data.total || 0)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      setSubmissions([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  const handleExport = () => {
    downloadSheet('knowmind-submissions.xlsx', 'Submissions', submissions, SUBMISSION_EXPORT_COLUMNS)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto">
        <div className="mb-8 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-4xl font-display font-bold text-primary mb-2">Submissions</h1>
            <p className="text-text-muted">{total} submission{total !== 1 ? 's' : ''}</p>
          </div>
          <Button
            onClick={handleExport}
            variant="secondary"
            disabled={submissions.length === 0}
            title="Export the submissions currently loaded to Excel"
          >
            <Download size={18} />
            Export to Excel
          </Button>
        </div>

        <div className="bg-surface rounded-lg shadow-lg p-6 border border-border mb-8">
          <h3 className="font-semibold text-text mb-4">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder="Search by member name..."
              value={memberNameFilter}
              onChange={(e) => { setMemberNameFilter(e.target.value); setPage(0) }}
            />
            <Select
              value={roundFilter}
              onChange={(e) => { setRoundFilter(e.target.value); setPage(0) }}
            >
              <option value="">All Rounds</option>
              <option value="pre">Pre-Assessment</option>
              <option value="mid">Mid-Assessment</option>
              <option value="post">Post-Assessment</option>
            </Select>
            <button
              onClick={() => { setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setPage(0) }}
              className="inline-flex items-center justify-center gap-1.5 h-11 px-3 border border-ink-200 rounded-md text-sm text-ink-700 hover:bg-purple-50 transition-colors"
            >
              {sortOrder === 'asc' ? (
                <ArrowUp className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              ) : (
                <ArrowDown className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              )}
              Date
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-error/10 border border-error rounded-lg p-4 mb-8">
            <p className="text-error">{error}</p>
          </div>
        )}

        <div className="hidden sm:block bg-surface rounded-lg shadow-lg border border-border overflow-hidden mb-8">
          {loading ? (
            <div className="p-8 text-center text-text-muted">Loading...</div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center text-text-muted">No submissions found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-primary/5 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-primary">Member</th>
                    <th className="px-4 py-3 text-left font-semibold text-primary">Round</th>
                    <th className="px-4 py-3 text-center font-semibold text-primary">Score</th>
                    <th className="px-4 py-3 text-center font-semibold text-primary">Band</th>
                    <th className="px-4 py-3 text-left font-semibold text-primary">Date</th>
                    <th className="px-4 py-3 text-center font-semibold text-primary">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, idx) => (
                    <tr key={sub.id} className={`border-b border-border transition-colors hover:bg-purple-50 ${idx % 2 === 0 ? 'bg-surface' : 'bg-purple-50/30'}`}>
                      <td className="px-4 py-3 font-medium text-text">{sub.member_name}</td>
                      <td className="px-4 py-3 text-text-muted capitalize">{sub.round}</td>
                      <td className="px-4 py-3 text-center font-semibold">{sub.overall.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <Pill band={BAND_TO_PILL[sub.ei_band] || 'pending'}>{sub.ei_band}</Pill>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs">{new Date(sub.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-center">
                        <Link href={`/console/submissions/${sub.id}`} className="inline-flex items-center gap-1 text-primary hover:text-primary-hover">
                          <Eye size={16} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="sm:hidden space-y-4 mb-8">
          {loading ? (
            <div className="text-center text-text-muted py-8">Loading...</div>
          ) : submissions.length === 0 ? (
            <div className="text-center text-text-muted py-8">No submissions found</div>
          ) : (
            submissions.map((sub) => (
              <Link key={sub.id} href={`/console/submissions/${sub.id}`} className="block bg-surface rounded-lg border border-border p-4 transition-colors hover:bg-purple-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-primary">{sub.member_name}</h3>
                    <p className="text-xs text-text-muted capitalize">{sub.round}</p>
                  </div>
                  <Pill band={BAND_TO_PILL[sub.ei_band] || 'pending'}>{sub.ei_band}</Pill>
                </div>
                <div className="space-y-1 text-sm">
                  <p>Score: <span className="font-semibold">{sub.overall.toFixed(2)}</span></p>
                  <p className="text-xs text-text-muted">{new Date(sub.created_at).toLocaleDateString()}</p>
                </div>
              </Link>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition-colors">
              Previous
            </button>
            <span className="text-sm text-text-muted">Page {page + 1} of {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition-colors">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
