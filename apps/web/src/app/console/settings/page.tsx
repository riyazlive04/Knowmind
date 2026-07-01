'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui'
import { downloadWorkbook, type Column } from '@/lib/export/xlsx'
import { DOMAINS, DOMAIN_ITEM_RANGES, REVERSE_ITEMS } from '@knowmind/shared'

// --- Shared column schemas (mirror the per-page exports) ---

const MEMBER_COLUMNS: Column<any>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'country_code', header: 'Country Code' },
  { key: 'phone', header: 'Phone' },
  { key: 'business', header: 'Business' },
  { key: 'location', header: 'Location' },
  { key: 'status', header: 'Status' },
  { key: 'ei_band', header: 'EI Band' },
  { key: 'overall_score', header: 'Overall Score' },
  { key: 'created_at', header: 'Created At' },
]

const SUBMISSION_COLUMNS: Column<any>[] = [
  { key: 'id', header: 'Submission ID' },
  { key: 'member_name', header: 'Member' },
  { key: 'round', header: 'Round' },
  { key: 'overall', header: 'Overall' },
  { key: 'ei_band', header: 'EI Band' },
  { key: 'created_at', header: 'Created At' },
]

const REPORT_COLUMNS: Column<any>[] = [
  { key: 'id', header: 'Report ID' },
  { key: 'member_name', header: 'Member' },
  { key: 'state', header: 'State/Status' },
  { key: 'created_at', header: 'Created At' },
  { key: 'updated_at', header: 'Updated At' },
]

const QUESTION_COLUMNS: Column<any>[] = [
  { key: 'id', header: 'Item ID' },
  { key: 'domainKey', header: 'Domain' },
  { key: 'domainName', header: 'Domain Name' },
  { key: 'text', header: 'Text' },
  { key: 'type', header: 'Type' },
  { key: 'reverse', header: 'Reverse-scored', map: (r) => (r.reverse ? 'Yes' : 'No') },
]

// Static questionnaire item schema from the shared domain model.
const QUESTION_ITEMS = DOMAINS.flatMap((domain) =>
  (DOMAIN_ITEM_RANGES[domain.key] || []).map((itemId) => ({
    id: itemId,
    domainKey: domain.key,
    domainName: domain.name,
    text: '',
    type: 'Likert (1-5)',
    reverse: REVERSE_ITEMS.includes(itemId),
  }))
).sort((a, b) => a.id - b.id)

export default function SettingsPage() {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExportAll = async () => {
    try {
      setExporting(true)
      setError(null)

      const [membersRes, submissionsRes, reportsRes] = await Promise.all([
        fetch('/api/members-operations?page=0&pageSize=10000'),
        fetch('/api/submissions?page=0&pageSize=10000'),
        fetch('/api/reports'),
      ])

      const [membersData, submissionsData, reportsData] = await Promise.all([
        membersRes.json(),
        submissionsRes.json(),
        reportsRes.json(),
      ])

      downloadWorkbook('knowmind-export.xlsx', [
        { name: 'Members', rows: membersData.members || [], columns: MEMBER_COLUMNS },
        { name: 'Submissions', rows: submissionsData.submissions || [], columns: SUBMISSION_COLUMNS },
        { name: 'Reports', rows: reportsData.reports || [], columns: REPORT_COLUMNS },
        { name: 'Questions', rows: QUESTION_ITEMS, columns: QUESTION_COLUMNS },
      ])
    } catch (err: any) {
      setError(err?.message || 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between animate-fade-in-up">
        <h1 className="text-3xl font-display font-bold text-primary">Settings</h1>
        <Button onClick={handleExportAll} variant="primary" disabled={exporting}>
          <Download size={18} />
          {exporting ? 'Exporting...' : 'Export all data'}
        </Button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error rounded-lg p-4 mb-6">
          <p className="text-error">{error}</p>
        </div>
      )}

      <div className="bg-surface border border-border rounded-lg p-8">
        <div className="space-y-6 max-w-2xl">
          <div>
            <h2 className="text-lg font-semibold text-text mb-4">Data Export</h2>
            <p className="text-text-muted">
              Download one Excel workbook with members, submissions, reports, and the
              questionnaire schema on separate sheets.
            </p>
          </div>
          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-text mb-4">Branding</h2>
            <p className="text-text-muted">Brand settings to be configured</p>
          </div>
          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-text mb-4">Preferences</h2>
            <p className="text-text-muted">User preferences to be configured</p>
          </div>
        </div>
      </div>
    </div>
  )
}
