'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckSquare, Square, AlertCircle, Download, ArrowUp, ArrowDown } from 'lucide-react'
import { Button, Input, Select } from '@/components/ui'
import { downloadSheet, type Column } from '@/lib/export/xlsx'

const REPORT_EXPORT_COLUMNS: Column<Report>[] = [
  { key: 'id', header: 'Report ID' },
  { key: 'member_name', header: 'Member' },
  { key: 'state', header: 'State/Status' },
  { key: 'created_at', header: 'Created At' },
  { key: 'updated_at', header: 'Updated At' },
]

interface Report {
  id: string
  member_id: string
  member_name: string
  member_business?: string
  overall_score?: number
  state: string
  created_at?: string
  updated_at: string
}

export default function ReportsPipelinePage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [stateFilter, setStateFilter] = useState('') // '' = all
  const [nameSearch, setNameSearch] = useState('')
  const [sortBy, setSortBy] = useState('updated_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const pageSize = 15

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkApproving, setBulkApproving] = useState(false)

  useEffect(() => {
    loadReports()
  }, [stateFilter, nameSearch, sortBy, sortOrder, page])

  const loadReports = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports')
      const data = await response.json()

      let filtered = data.reports || []

      // Filter by state
      if (stateFilter) {
        filtered = filtered.filter((r: Report) => r.state === stateFilter)
      }

      // Filter by name search
      if (nameSearch) {
        filtered = filtered.filter((r: Report) =>
          r.member_name.toLowerCase().includes(nameSearch.toLowerCase())
        )
      }

      // Sort
      filtered.sort((a: Report, b: Report) => {
        let aVal: any = a[sortBy as keyof Report]
        let bVal: any = b[sortBy as keyof Report]

        if (sortBy === 'updated_at') {
          aVal = new Date(aVal).getTime()
          bVal = new Date(bVal).getTime()
        }

        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })

      setReports(filtered)
      setSelectedIds(new Set())
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === reports.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(reports.map((r) => r.id)))
    }
  }

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) {
      alert('Select reports to approve')
      return
    }

    if (!window.confirm(`Approve ${selectedIds.size} selected reports?`)) {
      return
    }

    try {
      setBulkApproving(true)

      const response = await fetch('/api/reports/bulk/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportIds: Array.from(selectedIds),
        }),
      })

      if (!response.ok) {
        const msg = await response.text()
        setError(msg.slice(0, 200) || 'Bulk approve failed')
        return
      }

      const data = await response.json()
      alert(data.message)
      setSelectedIds(new Set())
      await loadReports()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBulkApproving(false)
    }
  }

  // Calculate state counts
  const stateCounts = {
    Draft: 0,
    Edited: 0,
    Approved: 0,
    Sent: 0,
    Hold: 0,
    Failed: 0,
  }

  reports.forEach((r) => {
    if (stateCounts.hasOwnProperty(r.state)) {
      stateCounts[r.state as keyof typeof stateCounts]++
    }
  })

  const getStateColor = (state: string) => {
    switch (state) {
      case 'Draft':
        return 'bg-ink-100 text-ink-700'
      case 'Edited':
        return 'bg-info-soft text-info'
      case 'Approved':
        return 'bg-success-soft text-success'
      case 'Sent':
        return 'bg-purple-100 text-purple-700'
      case 'Hold':
        return 'bg-warning-soft text-warning'
      case 'Failed':
        return 'bg-danger-soft text-danger'
      default:
        return 'bg-ink-100 text-ink-700'
    }
  }

  const displayReports = reports.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(reports.length / pageSize)

  const handleExport = () => {
    downloadSheet('knowmind-reports.xlsx', 'Reports', reports, REPORT_EXPORT_COLUMNS)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-4xl font-display font-bold text-primary mb-2">Report Pipeline</h1>
            <p className="text-text-muted">Review queue for all reports</p>
          </div>
          <Button
            onClick={handleExport}
            variant="secondary"
            disabled={reports.length === 0}
            title="Export the reports currently loaded to Excel"
          >
            <Download size={18} />
            Export to Excel
          </Button>
        </div>

        {/* State Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Object.entries(stateCounts).map(([state, count]) => (
            <div key={state} className="bg-surface rounded-lg shadow-sm p-4 border border-border text-center hover-lift">
              <p className="text-sm text-text-muted mb-1">{state}</p>
              <p className="text-3xl font-bold text-primary">{count}</p>
            </div>
          ))}
        </div>

        {/* Filters & Actions */}
        <div className="bg-surface rounded-lg shadow-md p-6 border border-border mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Filter by State</label>
              <Select
                value={stateFilter}
                onChange={(e) => {
                  setStateFilter(e.target.value)
                  setPage(0)
                }}
              >
                <option value="">All States</option>
                {Object.keys(stateCounts).map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Search Member Name</label>
              <Input
                type="text"
                value={nameSearch}
                onChange={(e) => {
                  setNameSearch(e.target.value)
                  setPage(0)
                }}
                placeholder="Type name..."
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={() => {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                  setPage(0)
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm hover:bg-purple-50 transition-colors"
              >
                {sortOrder === 'asc' ? (
                  <ArrowUp className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                ) : (
                  <ArrowDown className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                )}
                {sortBy}
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <p className="text-sm font-medium text-text">{selectedIds.size} selected</p>
              <Button
                onClick={handleBulkApprove}
                disabled={bulkApproving}
                variant="primary"
              >
                {bulkApproving ? 'Approving...' : 'Bulk Approve'}
              </Button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-error/10 border border-error rounded-lg p-4 mb-8">
            <p className="text-error">{error}</p>
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden sm:block bg-surface rounded-lg shadow-md border border-border overflow-hidden mb-8">
          {loading ? (
            <div className="p-8 text-center text-text-muted">Loading...</div>
          ) : displayReports.length === 0 ? (
            <div className="p-8 text-center text-text-muted">No reports found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-primary/5 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-primary">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === displayReports.length && displayReports.length > 0}
                        onChange={toggleSelectAll}
                        className="cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-primary">Member</th>
                    <th className="px-4 py-3 text-left font-semibold text-primary">Business</th>
                    <th className="px-4 py-3 text-center font-semibold text-primary">Score</th>
                    <th className="px-4 py-3 text-center font-semibold text-primary">Band</th>
                    <th className="px-4 py-3 text-left font-semibold text-primary">State</th>
                    <th className="px-4 py-3 text-left font-semibold text-primary">Updated</th>
                    <th className="px-4 py-3 text-center font-semibold text-primary">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayReports.map((report, idx) => {
                    const band = !report.overall_score
                      ? '—'
                      : report.overall_score >= 4.0
                        ? 'High'
                        : report.overall_score >= 3.0
                          ? 'Moderate'
                          : 'Needs Support'

                    return (
                      <tr
                        key={report.id}
                        className={`border-b border-border transition-colors hover:bg-purple-50 ${idx % 2 === 0 ? 'bg-surface' : 'bg-purple-50/30'}`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(report.id)}
                            onChange={() => toggleSelect(report.id)}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-text">{report.member_name}</td>
                        <td className="px-4 py-3 text-text-muted">{report.member_business || '—'}</td>
                        <td className="px-4 py-3 text-center font-semibold">
                          {report.overall_score?.toFixed(2) || '—'}
                        </td>
                        <td className="px-4 py-3 text-center text-sm">{band}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStateColor(report.state)}`}>
                            {report.state}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-muted text-xs">
                          {new Date(report.updated_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Link
                            href={`/console/reports/${report.id}/edit`}
                            className="text-primary hover:text-primary-hover font-medium"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-4 mb-8">
          {loading ? (
            <div className="text-center text-text-muted py-8">Loading...</div>
          ) : displayReports.length === 0 ? (
            <div className="text-center text-text-muted py-8">No reports found</div>
          ) : (
            displayReports.map((report) => {
              const band = !report.overall_score
                ? '—'
                : report.overall_score >= 4.0
                  ? 'High'
                  : report.overall_score >= 3.0
                    ? 'Moderate'
                    : 'Needs Support'

              return (
                <div
                  key={report.id}
                  className="bg-surface rounded-lg border border-border p-4 flex items-start justify-between"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(report.id)}
                      onChange={() => toggleSelect(report.id)}
                      className="cursor-pointer mt-1"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary">{report.member_name}</h3>
                      <p className="text-xs text-text-muted">{report.member_business || 'No business'}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm">Score: {report.overall_score?.toFixed(2) || '—'}</span>
                        <span className="text-sm">Band: {band}</span>
                      </div>
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStateColor(report.state)}`}>
                          {report.state}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/console/reports/${report.id}/edit`}
                    className="text-primary hover:text-primary-hover font-medium text-sm ml-2"
                  >
                    Edit
                  </Link>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-text-muted">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
