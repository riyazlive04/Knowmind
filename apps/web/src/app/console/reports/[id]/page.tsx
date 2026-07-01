'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReportTemplate from '@/components/report/ReportTemplate'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'

interface ReportData {
  report: any
  member: any
  submission: any
}

export default function ReportDetailPage() {
  const params = useParams()
  const reportId = params.id as string
  const router = useRouter()

  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadReport()
  }, [reportId])

  const loadReport = async () => {
    try {
      setLoading(true)

      // For now, we'll fetch using the report ID
      // In a real app, we'd parse the ID to get member ID
      const response = await fetch(`/api/reports`)
      const allReports = await response.json()

      const report = allReports.reports?.find((r: any) => r.id === reportId)
      if (!report) {
        setError('Report not found')
        return
      }

      // Fetch full details
      const detailResponse = await fetch(`/api/reports?memberId=${report.member_id}`)
      const detailData = await detailResponse.json()

      if (!detailResponse.ok) {
        setError('Failed to load report details')
        return
      }

      setData(detailData)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      setGenerating(true)
      // For now, use browser's print-to-PDF
      // In production, integrate with a PDF rendering service
      window.print()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <p className="text-center text-ink-500">Loading report...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4">
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

  return (
    <div className="bg-white">
      {/* Toolbar (hidden on print) */}
      <div
        className="no-print sticky top-0 z-50 bg-white border-b border-ink-200 px-4 py-4 shadow-sm"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-primary hover:text-primary-hover text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Back
          </button>
          <h1 className="text-lg font-display font-bold text-primary flex-1 text-center">
            {data.member.name} - EI Report
          </h1>
          <Button onClick={handleExportPDF} disabled={generating} variant="primary">
            {generating ? 'Exporting...' : 'Export PDF'}
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div className="animate-fade-in-up" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        <ReportTemplate
          member={data.member}
          submission={data.submission}
          report={data.report}
        />
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          .bg-gradient-to-br { background: white !important; }
        }
      `}</style>
    </div>
  )
}
