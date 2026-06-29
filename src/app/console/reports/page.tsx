'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Download } from 'lucide-react'

interface Report {
  id: string
  member_id: string
  member_name: string
  state: string
  created_at: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [docxDir, setDocxDir] = useState('')

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports')
      const data = await response.json()
      setReports(data.reports || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReports = async () => {
    try {
      setGenerating(true)
      setError(null)

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          docxDir: docxDir || ''
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || data.error || 'Generation failed')
        console.error('Generation error:', data)
        return
      }

      // Reload reports
      await new Promise(r => setTimeout(r, 500))
      await loadReports()

      const successCount = data.results?.filter((r: any) => r.success).length || 0
      alert(`Reports generated! ${successCount}/${data.results?.length || 0} succeeded`)
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2 font-fraunces">Reports</h1>
          <p className="text-text-muted">{reports.length} reports generated</p>
        </div>

        {reports.length === 0 && (
          <div className="bg-surface rounded-lg shadow-lg p-8 border border-border mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4 font-fraunces">Generate Reports</h2>
            <p className="text-text-muted mb-4">Generate EI reports for all 42 members from their docx files.</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Docx Directory Path</label>
                <input
                  type="text"
                  value={docxDir}
                  onChange={(e) => setDocxDir(e.target.value)}
                  placeholder="Path to docx files"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {error && (
                <div className="bg-error/10 border border-error rounded-lg p-4">
                  <p className="text-error text-sm">{error}</p>
                </div>
              )}
              <button
                onClick={handleGenerateReports}
                disabled={generating}
                className="px-6 py-3 bg-primary text-primary-fg font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate All Reports'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center text-text-muted py-12">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-center text-text-muted py-12">No reports. Generate above.</div>
        ) : (
          <div className="bg-surface rounded-lg shadow-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-primary/5 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-primary">Member</th>
                    <th className="px-4 py-3 text-left font-semibold text-primary">State</th>
                    <th className="px-4 py-3 text-left font-semibold text-primary">Created</th>
                    <th className="px-4 py-3 text-center font-semibold text-primary">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, idx) => (
                    <tr key={report.id} className={`border-b border-border ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-3 font-medium text-text">{report.member_name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {report.state}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs">{new Date(report.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-center">
                        <Link href={`/console/reports/${report.id}`} className="text-primary hover:text-primary-hover">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}