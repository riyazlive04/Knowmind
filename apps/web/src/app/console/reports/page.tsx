'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckSquare, Square, AlertCircle } from 'lucide-react'

interface Report {
  id: string
  member_id: string
  member_name: string
  member_business?: string
  overall_score?: number
  state: string
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

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Bulk approve failed')
        return
      }

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
        return 'bg-gray-100 text-gray-700'
      case 'Edited':
        return 'bg-blue-100 text-blue-700'
      case 'Approved':
        return 'bg-green-100 text-green-700'
      case 'Sent':
        return 'bg-purple-100 text-purple-700'
      case 'Hold':
        return 'bg-amber-100 text-amber-700'
      case 'Failed':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const displayReports = reports.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(reports.length / pageSize)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2 font-fraunces">Report Pipeline</h1>
          <p className="text-text-muted">Review queue for all reports</p>
        </div>

        {/* State Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Object.entries(stateCounts).map(([state, count]) => (
            <div key={state} className="bg-white rounded-lg shadow p-4 border border-border text-center">
              <p className="text-sm text-text-muted mb-1">{state}</p>
              <p className="text-3xl font-bold text-primary">{count}</p>
            </div>
          ))}
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-border mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Filter by State</label>
              <select
                value={stateFilter}
                onChange={(e) => {
                  setStateFilter(e.target.value)
                  setPage(0)
                }}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All States</option>
                {Object.keys(stateCounts).map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Search Member Name</label>
              <input
                type="text"
                value={nameSearch}
                onChange={(e) => {
                  setNameSearch(e.target.value)
                  setPage(0)
                }}
                placeholder="Type name..."
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={() => {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                  setPage(0)
                }}
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm hover:bg-gray-100"
              >
                {sortOrder === 'asc' ? '↑' : '↓'} {sortBy}
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <p className="text-sm font-medium text-text">{selectedIds.size} selected</p>
              <button
                onClick={handleBulkApprove}
                disabled={bulkApproving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {bulkApproving ? 'Approving...' : 'Bulk Approve'}
              </button>
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
        <div className="hidden sm:block bg-white rounded-lg shadow-lg border border-border overflow-hidden mb-8">
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
                        className={`border-b border-border ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
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
                  className="bg-white rounded-lg border border-border p-4 flex items-start justify-between"
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
              className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Previous
            </button>
            <span className="text-sm text-text-muted">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
