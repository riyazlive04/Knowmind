'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { callBackendApi } from '@/lib/backendApi'

interface PreviewData {
  headers: string[]
  preview: {
    total: number
    new: number
    update: number
    duplicate: number
    existing: number
  }
  samples: {
    new: any[]
    update: any[]
    duplicate: any[]
  }
  errors: Array<{ row: number; error: string }>
  rowsToImport: any[]
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<any | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setPreview(null)
      setError(null)
    }
  }

  const handlePreview = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await callBackendApi('/api/import/preview', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to parse file')
        return
      }

      setPreview(data)
    } catch (err: any) {
      setError(err.message || 'Error parsing file')
    } finally {
      setLoading(false)
    }
  }

  const handleExecuteImport = async () => {
    if (!preview) {
      setError('No preview data')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await callBackendApi('/api/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: preview.rowsToImport }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Import failed')
        return
      }

      setSuccess(data)
      setPreview(null)
      setFile(null)

      // Redirect to members page after success
      setTimeout(() => {
        router.push('/console/members')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Error executing import')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-primary mb-3 font-fraunces">
            Import Members
          </h1>
          <p className="text-lg text-text-muted">
            Upload the EI assessment data to import pre-assessment members
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-success/10 border border-success rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-success mb-4">✓ Import Successful</h3>
            <div className="text-sm space-y-2">
              <p>
                <strong>Members Created:</strong> {success.created}
              </p>
              <p>
                <strong>Cohort Average:</strong> {success.cohortStats.average}
              </p>
              <p>
                <strong>Weakest Domain:</strong> {success.cohortStats.weakestDomain}
              </p>
              <p className="text-text-muted mt-4 text-xs">
                Redirecting to members page...
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-error/10 border border-error rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-error mb-2">Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* File Upload */}
        {!success && (
          <div className="bg-surface rounded-lg shadow-lg p-8 border border-border mb-8">
            <label className="block mb-4">
              <span className="block text-sm font-medium text-text mb-2">
                Select Excel File
              </span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={loading}
                className="block w-full text-sm px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>

            <button
              onClick={handlePreview}
              disabled={!file || loading}
              className="px-6 py-3 bg-primary text-primary-fg font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Parsing...' : 'Preview'}
            </button>
          </div>
        )}

        {/* Preview */}
        {preview && !success && (
          <div className="space-y-8">
            {/* Summary */}
            <div className="bg-surface rounded-lg shadow-lg p-8 border border-border">
              <h2 className="text-2xl font-bold text-primary mb-6 font-fraunces">
                Import Preview
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm text-text-muted">Total Rows</p>
                  <p className="text-2xl font-bold text-primary">{preview.preview.total}</p>
                </div>
                <div className="bg-success/5 p-4 rounded-lg">
                  <p className="text-sm text-text-muted">New</p>
                  <p className="text-2xl font-bold text-success">{preview.preview.new}</p>
                </div>
                <div className="bg-amber-100 p-4 rounded-lg">
                  <p className="text-sm text-text-muted">Updates</p>
                  <p className="text-2xl font-bold text-amber-700">{preview.preview.update}</p>
                </div>
                <div className="bg-error/5 p-4 rounded-lg">
                  <p className="text-sm text-text-muted">Duplicates</p>
                  <p className="text-2xl font-bold text-error">{preview.preview.duplicate}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-text-muted">Existing</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {preview.preview.existing}
                  </p>
                </div>
              </div>

              {/* Errors */}
              {preview.errors && preview.errors.length > 0 && (
                <div className="mb-8 p-4 bg-error/5 border border-error/20 rounded-lg">
                  <h4 className="font-semibold text-error mb-2">Parsing Errors</h4>
                  <ul className="text-sm space-y-1">
                    {preview.errors.map((err, i) => (
                      <li key={i} className="text-error/80">
                        Row {err.row}: {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Samples */}
              {preview.samples.new.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-success mb-3">Sample New Members</h3>
                  <div className="space-y-2 text-sm">
                    {preview.samples.new.map((row, i) => (
                      <div key={i} className="p-3 bg-success/5 rounded border border-success/20">
                        <p>
                          <strong>{row.name}</strong>
                          {row.business && ` - ${row.business}`}
                        </p>
                        <p className="text-xs text-text-muted">
                          Overall: {row.overall?.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-border">
                <button
                  onClick={() => setPreview(null)}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleExecuteImport}
                  disabled={loading}
                  className="px-6 py-3 bg-primary text-primary-fg font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Importing...' : 'Commit Import'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
