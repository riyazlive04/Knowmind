'use client'

import { useState, useEffect } from 'react'
import { Download, Users } from 'lucide-react'
import { Button } from '@/components/ui'
import { downloadWorkbook, type Column } from '@/lib/export/xlsx'
import { DOMAINS } from '@knowmind/shared'

interface SubmissionListItem {
  id: string
  member_id: string
  member_name: string
  round: string
  overall: number
  ei_band: string
  created_at: string
}

interface DomainAvgRow {
  domain: string
  domainName: string
  average: number | null
}

interface SummaryRow {
  metric: string
  value: string | number
}

const SUMMARY_COLUMNS: Column<SummaryRow>[] = [
  { key: 'metric', header: 'Metric' },
  { key: 'value', header: 'Value' },
]

const DOMAIN_COLUMNS: Column<DomainAvgRow>[] = [
  { key: 'domain', header: 'Domain' },
  { key: 'domainName', header: 'Domain Name' },
  { key: 'average', header: 'Average Score' },
]

export default function CohortPage() {
  const [subs, setSubs] = useState<SubmissionListItem[]>([])
  const [domainAverages, setDomainAverages] = useState<DomainAvgRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCohort()
  }, [])

  const loadCohort = async () => {
    try {
      setLoading(true)
      // Fetch the full submissions list (count + overall averages).
      const res = await fetch('/api/submissions?page=0&pageSize=1000&round=pre')
      const data = await res.json()
      const list: SubmissionListItem[] = data.submissions || []
      setSubs(list)

      // Per-domain averages require domain_scores, which the list endpoint does
      // not return. Fetch each submission's detail (read-only, existing route)
      // and average the domain_scores by domain key.
      const sums: Record<string, number> = {}
      const counts: Record<string, number> = {}
      const details = await Promise.all(
        list.map((s) =>
          fetch(`/api/submissions?id=${s.id}`)
            .then((r) => r.json())
            .catch(() => null)
        )
      )
      details.forEach((d) => {
        const ds: Record<string, number> | undefined = d?.submission?.domain_scores
        if (!ds) return
        for (const domain of DOMAINS) {
          const v = ds[domain.key]
          if (typeof v === 'number') {
            sums[domain.key] = (sums[domain.key] || 0) + v
            counts[domain.key] = (counts[domain.key] || 0) + 1
          }
        }
      })

      const avgRows: DomainAvgRow[] = DOMAINS.map((domain) => ({
        domain: domain.key,
        domainName: domain.name,
        average: counts[domain.key]
          ? parseFloat((sums[domain.key] / counts[domain.key]).toFixed(2))
          : null,
      }))
      setDomainAverages(avgRows)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const count = subs.length
  const average =
    count > 0
      ? parseFloat((subs.reduce((acc, s) => acc + (s.overall || 0), 0) / count).toFixed(2))
      : null

  const scored = domainAverages.filter((d) => d.average != null)
  const weakest =
    scored.length > 0
      ? scored.reduce((min, d) => (d.average! < min.average! ? d : min))
      : null

  const handleExport = () => {
    const summaryRows: SummaryRow[] = [
      { metric: 'Submission Count', value: count },
      { metric: 'Average Overall Score', value: average ?? '' },
      { metric: 'Weakest Domain', value: weakest ? weakest.domainName : '' },
      { metric: 'Weakest Domain Average', value: weakest?.average ?? '' },
    ]
    downloadWorkbook('knowmind-cohort.xlsx', [
      { name: 'Summary', rows: summaryRows, columns: SUMMARY_COLUMNS },
      { name: 'Domain Averages', rows: domainAverages, columns: DOMAIN_COLUMNS },
    ])
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between animate-fade-in-up">
        <h1 className="text-3xl font-display font-bold text-primary">Cohort</h1>
        <Button
          onClick={handleExport}
          variant="secondary"
          disabled={loading || count === 0}
          title="Export cohort summary and per-domain averages to Excel"
        >
          <Download size={18} />
          Export to Excel
        </Button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error rounded-lg p-4 mb-6">
          <p className="text-error">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="bg-surface border border-border rounded-lg p-12 text-center text-text-muted">
          Loading cohort analytics...
        </div>
      ) : count === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600">
            <Users className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
          </div>
          <p className="font-medium text-text">No cohort data yet</p>
          <p className="text-sm text-text-muted mt-1">
            Cohort analytics will appear here once submissions roll in.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface rounded-lg shadow-sm p-4 border border-border text-center hover-lift">
              <p className="text-sm text-text-muted mb-1">Submissions</p>
              <p className="text-3xl font-bold text-primary">{count}</p>
            </div>
            <div className="bg-surface rounded-lg shadow-sm p-4 border border-border text-center hover-lift">
              <p className="text-sm text-text-muted mb-1">Average Score</p>
              <p className="text-3xl font-bold text-primary">{average ?? '—'}</p>
            </div>
            <div className="bg-surface rounded-lg shadow-sm p-4 border border-border text-center hover-lift">
              <p className="text-sm text-text-muted mb-1">Weakest Domain</p>
              <p className="text-lg font-bold text-primary">{weakest ? weakest.domainName : '—'}</p>
            </div>
          </div>

          {/* Per-domain averages */}
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-primary/5 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-primary">Domain</th>
                  <th className="px-4 py-3 text-center font-semibold text-primary">Average Score</th>
                </tr>
              </thead>
              <tbody>
                {domainAverages.map((d, idx) => (
                  <tr
                    key={d.domain}
                    className={`border-b border-border ${idx % 2 === 0 ? 'bg-surface' : 'bg-purple-50/30'}`}
                  >
                    <td className="px-4 py-3 font-medium text-text">{d.domainName}</td>
                    <td className="px-4 py-3 text-center text-text-muted">{d.average ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
