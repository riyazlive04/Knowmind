'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui'

interface Report {
  id: string
  member_id: string
  member_name: string
  state: string
}

interface Delivery {
  id: string
  report_id: string
  channel: string
  status: string
  evolution_message_id: string | null
  attempt: number
  error: string | null
  sent_at: string | null
}

interface QueueItem {
  reportId: string
  status: 'pending' | 'sending' | 'sent' | 'failed'
  delayMs: number
  evolutionMessageId?: string | null
  error?: string | null
}

interface QueueJob {
  id: string
  status: 'running' | 'completed'
  total: number
  sent: number
  failed: number
  items: QueueItem[]
  nextSendInMs: number | null
}

const SENDABLE_STATES = ['approved', 'failed', 'retry']

const statusColor = (s: string) => {
  switch (s) {
    case 'sent':
      return 'bg-purple-50 text-purple-600'
    case 'delivered':
      return 'bg-info-soft text-info'
    case 'read':
      return 'bg-success-soft text-success'
    case 'failed':
      return 'bg-danger-soft text-danger'
    case 'pending':
    case 'queued':
      return 'bg-warning-soft text-warning'
    default:
      return 'bg-ink-100 text-ink-700'
  }
}

export default function DeliveryPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [connection, setConnection] = useState<{ configured: boolean; connectionStatus: string | null } | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [minSec, setMinSec] = useState(30)
  const [maxSec, setMaxSec] = useState(90)
  const [job, setJob] = useState<QueueJob | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadAll = useCallback(async () => {
    try {
      setLoading(true)
      const [reportsRes, deliveriesRes, statusRes] = await Promise.all([
        fetch('/api/reports').then((r) => r.json()),
        fetch('/api/delivery').then((r) => r.json()),
        fetch('/api/delivery?resource=status').then((r) => r.json()),
      ])

      const sendable: Report[] = (reportsRes.reports || []).filter((r: Report) =>
        SENDABLE_STATES.includes((r.state || '').toLowerCase())
      )
      setReports(sendable)
      setDeliveries(deliveriesRes.deliveries || [])
      setConnection(statusRes && 'configured' in statusRes ? statusRes : null)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [loadAll])

  const pollJob = useCallback(
    (jobId: string) => {
      if (pollRef.current) clearInterval(pollRef.current)
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/delivery/queue/${jobId}`).then((r) => r.json())
          if (res.job) {
            setJob(res.job)
            if (res.job.status === 'completed') {
              if (pollRef.current) clearInterval(pollRef.current)
              setSending(false)
              loadAll() // refresh history + report states
            }
          }
        } catch {
          /* keep polling */
        }
      }, 2000)
    },
    [loadAll]
  )

  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const toggleAll = () => {
    setSelected(selected.size === reports.length ? new Set() : new Set(reports.map((r) => r.id)))
  }

  const handleSend = async () => {
    if (selected.size === 0) {
      alert('Select at least one report to send')
      return
    }
    if (minSec > maxSec) {
      alert('Minimum interval cannot exceed maximum')
      return
    }
    if (
      !window.confirm(
        `Send ${selected.size} report(s) over WhatsApp with a randomized ${minSec}–${maxSec}s gap between each?`
      )
    ) {
      return
    }

    try {
      setSending(true)
      setError(null)
      const res = await fetch('/api/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-bulk',
          reportIds: Array.from(selected),
          minIntervalMs: minSec * 1000,
          maxIntervalMs: maxSec * 1000,
        }),
      }).then((r) => r.json())

      if (!res.success) {
        setError(res.error || 'Failed to start bulk send')
        setSending(false)
        return
      }
      setJob(res.job)
      setSelected(new Set())
      pollJob(res.jobId)
    } catch (err: any) {
      setError(err.message)
      setSending(false)
    }
  }

  const connBadge = () => {
    if (!connection) return null
    if (!connection.configured) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-warning-soft text-warning">
          Not configured (stub mode)
        </span>
      )
    }
    const open = connection.connectionStatus === 'open'
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${open ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}
      >
        WhatsApp: {connection.connectionStatus || 'unknown'}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-3 animate-fade-in-up">
          <div>
            <h1 className="text-4xl font-display font-bold text-primary mb-2">Delivery</h1>
            <p className="text-text-muted">Send approved reports over WhatsApp with staggered intervals</p>
          </div>
          {connBadge()}
        </div>

        {error && (
          <div className="bg-error/10 border border-error rounded-lg p-4 mb-8">
            <p className="text-error">{error}</p>
          </div>
        )}

        {/* Live job progress */}
        {job && (
          <div className="bg-surface rounded-lg shadow-md p-6 border border-border mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary">
                {job.status === 'running' ? 'Sending…' : 'Batch complete'}
              </h2>
              <span className="text-sm text-text-muted">
                {job.sent + job.failed}/{job.total} processed · {job.sent} sent · {job.failed} failed
              </span>
            </div>
            <div className="w-full bg-ink-100 rounded-full h-2 mb-4">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${job.total ? ((job.sent + job.failed) / job.total) * 100 : 0}%` }}
              />
            </div>
            {job.status === 'running' && job.nextSendInMs != null && (
              <p className="text-sm text-text-muted mb-3">Next message in ~{Math.round(job.nextSendInMs / 1000)}s</p>
            )}
            <div className="space-y-1 max-h-48 overflow-y-auto text-sm">
              {job.items.map((it, i) => (
                <div key={it.reportId} className="flex items-center gap-3">
                  <span className="text-text-muted w-6">{i + 1}.</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(it.status)}`}>
                    {it.status}
                  </span>
                  {it.delayMs > 0 && (
                    <span className="text-xs text-text-muted">waited {Math.round(it.delayMs / 1000)}s</span>
                  )}
                  {it.error && <span className="text-xs text-error truncate">{it.error}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ready to send */}
        <div className="bg-surface rounded-lg shadow-md p-6 border border-border mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-lg font-semibold text-primary">Ready to send ({reports.length})</h2>
            <div className="flex items-end gap-3 flex-wrap">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Min gap (s)</label>
                <input
                  type="number"
                  min={1}
                  value={minSec}
                  onChange={(e) => setMinSec(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Max gap (s)</label>
                <input
                  type="number"
                  min={1}
                  value={maxSec}
                  onChange={(e) => setMaxSec(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button onClick={handleSend} disabled={sending || selected.size === 0} variant="primary">
                {sending ? 'Sending…' : `Send ${selected.size || ''} (staggered)`}
              </Button>
            </div>
          </div>

          {loading ? (
            <p className="text-text-muted text-center py-6">Loading…</p>
          ) : reports.length === 0 ? (
            <p className="text-text-muted text-center py-6">No approved reports waiting to send</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-primary/5 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selected.size === reports.length && reports.length > 0}
                        onChange={toggleAll}
                        className="cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-primary">Member</th>
                    <th className="px-4 py-3 text-left font-semibold text-primary">State</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, idx) => (
                    <tr
                      key={r.id}
                      className={`border-b border-border hover:bg-purple-50 ${idx % 2 ? 'bg-purple-50/30' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(r.id)}
                          onChange={() => toggle(r.id)}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-text">{r.member_name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor(r.state.toLowerCase())}`}
                        >
                          {r.state}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delivery history */}
        <div className="bg-surface rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-lg font-semibold text-primary mb-4">Delivery history ({deliveries.length})</h2>
          {deliveries.length === 0 ? (
            <p className="text-text-muted text-center py-6">No delivery records yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-primary/5 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-primary">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-primary">Channel</th>
                    <th className="px-4 py-3 text-left font-semibold text-primary">Message ID</th>
                    <th className="px-4 py-3 text-center font-semibold text-primary">Attempt</th>
                    <th className="px-4 py-3 text-left font-semibold text-primary">Sent</th>
                    <th className="px-4 py-3 text-left font-semibold text-primary">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d, idx) => (
                    <tr key={d.id} className={`border-b border-border ${idx % 2 ? 'bg-purple-50/30' : ''}`}>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor(d.status)}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-muted">{d.channel}</td>
                      <td className="px-4 py-3 text-text-muted font-mono text-xs">{d.evolution_message_id || '—'}</td>
                      <td className="px-4 py-3 text-center">{d.attempt}</td>
                      <td className="px-4 py-3 text-text-muted text-xs">
                        {d.sent_at ? new Date(d.sent_at).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-error text-xs max-w-xs truncate">{d.error || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
