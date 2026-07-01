'use client'

import { FormEvent, useEffect, useState } from 'react'
import { ClipboardList, Plus, Download, Trash2, X, Pencil } from 'lucide-react'
import { Button, Card, Input, Select } from '@/components/ui'
import { downloadSheet } from '@/lib/export/xlsx'

// Client-safe copy of the canonical domains (the API also enforces these).
const DOMAINS = [
  { id: 1, name: 'Self-Awareness' },
  { id: 2, name: 'Self-Regulation' },
  { id: 3, name: 'Motivation' },
  { id: 4, name: 'Empathy' },
  { id: 5, name: 'Social & Leadership' },
  { id: 6, name: 'Relationship Intelligence' },
]

interface QuestionItem {
  id: number
  domain: number
  domain_name: string
  text: string
  type: 'likert' | 'free_text'
  reverse: boolean
  placeholder?: string
}
interface TestSummary {
  id: string
  version_no: number
  status: 'draft' | 'published'
  created_at: string
  total: number
  likert: number
  free_text: number
}
interface TestDetail {
  id: string
  version_no: number
  status: 'draft' | 'published'
  items: QuestionItem[]
}

function StatusChip({ status }: { status: string }) {
  const published = status === 'published'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        published ? 'bg-success-soft text-success' : 'bg-info-soft text-info'
      }`}
    >
      {published ? 'Published' : 'Draft'}
    </span>
  )
}

export default function QuestionsPage() {
  const [tests, setTests] = useState<TestSummary[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<TestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  // Test pending deletion (confirmation modal).
  const [pendingDelete, setPendingDelete] = useState<TestSummary | null>(null)

  // Add/edit-question form. editingId != null means we're editing that item.
  const [qText, setQText] = useState('')
  const [qType, setQType] = useState<'likert' | 'free_text'>('likert')
  const [qDomain, setQDomain] = useState(1)
  const [qReverse, setQReverse] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  function resetForm() {
    setEditingId(null)
    setQText('')
    setQType('likert')
    setQDomain(1)
    setQReverse(false)
  }

  function startEdit(q: QuestionItem) {
    setEditingId(q.id)
    setQText(q.text)
    setQType(q.type)
    setQDomain(q.type === 'free_text' ? 1 : q.domain)
    setQReverse(q.reverse)
    // Bring the editor into view on smaller screens.
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function loadTests(selectAfter?: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/questions')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load tests')
      setTests(data.tests)
      const next = selectAfter ?? selectedId
      if (next && data.tests.some((t: TestSummary) => t.id === next)) {
        selectTest(next)
      } else if (data.tests.length && !selectAfter && !selectedId) {
        selectTest(data.tests[0].id)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function selectTest(id: string) {
    setSelectedId(id)
    setError('')
    try {
      const res = await fetch(`/api/questions?id=${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load test')
      const t = data.test
      setDetail({
        id: t.id,
        version_no: t.version_no,
        status: t.status,
        items: Array.isArray(t.items) ? t.items : [],
      })
    } catch (e: any) {
      setError(e.message)
    }
  }

  useEffect(() => {
    loadTests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function post(payload: any) {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      return data
    } catch (e: any) {
      setError(e.message)
      return null
    } finally {
      setBusy(false)
    }
  }

  async function createTest() {
    const data = await post({ action: 'createTest' })
    if (data?.test) await loadTests(data.test.id)
  }

  async function submitQuestion(e: FormEvent) {
    e.preventDefault()
    if (!detail) return
    const question = { text: qText, type: qType, domain: qDomain, reverse: qReverse }
    const data = await post(
      editingId != null
        ? { action: 'updateQuestion', id: detail.id, questionId: editingId, question }
        : { action: 'addQuestion', id: detail.id, question }
    )
    if (data?.test) {
      resetForm()
      setDetail({ ...detail, items: data.test.items })
      loadTests(detail.id)
    }
  }

  async function deleteQuestion(questionId: number) {
    if (!detail) return
    const data = await post({ action: 'deleteQuestion', id: detail.id, questionId })
    if (data?.test) {
      if (editingId === questionId) resetForm()
      setDetail({ ...detail, items: data.test.items })
      loadTests(detail.id)
    }
  }

  async function confirmDeleteTest() {
    if (!pendingDelete) return
    const target = pendingDelete
    const data = await post({ action: 'deleteTest', id: target.id })
    setPendingDelete(null)
    if (data?.ok) {
      // Clear the open detail if it was the one removed, then reload.
      if (selectedId === target.id) {
        setSelectedId(null)
        setDetail(null)
      }
      const remaining = tests.filter((t) => t.id !== target.id)
      await loadTests(selectedId === target.id ? remaining[0]?.id : undefined)
    }
  }

  async function togglePublish() {
    if (!detail) return
    const status = detail.status === 'published' ? 'draft' : 'published'
    const data = await post({ action: 'updateStatus', id: detail.id, status })
    if (data?.test) {
      setDetail({ ...detail, status: data.test.status })
      loadTests(detail.id)
    }
  }

  function exportTest() {
    if (!detail) return
    downloadSheet(
      `knowmind-test-v${detail.version_no}`,
      `Test v${detail.version_no}`,
      detail.items,
      [
        { key: 'id', header: 'Item ID' },
        { key: 'domain', header: 'Domain' },
        { key: 'domain_name', header: 'Domain Name' },
        { key: 'text', header: 'Text' },
        { key: 'type', header: 'Type' },
        { key: 'reverse', header: 'Reverse-scored' },
      ]
    )
  }

  const likertCount = detail?.items.filter((i) => i.type !== 'free_text').length ?? 0
  const isCanonical = likertCount === 27
  const isPublished = detail?.status === 'published'

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Questions</h1>
          <p className="text-sm text-text-muted mt-1">
            Create assessment tests and add questions to them.
          </p>
        </div>
        <Button variant="primary" onClick={createTest} disabled={busy}>
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          Create Test
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-text-muted">Loading tests…</p>
      ) : tests.length === 0 ? (
        <Card tone="base" className="text-center !py-12">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600">
            <ClipboardList className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
          </div>
          <p className="font-medium text-ink-700">No tests yet</p>
          <p className="mt-1 text-sm text-ink-500">
            Create your first test, then add questions to it.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[20rem_1fr]">
          {/* Test list */}
          <div className="space-y-2">
            {tests.map((t) => {
              const active = t.id === selectedId
              return (
                <div
                  key={t.id}
                  className={`group relative rounded-xl border p-4 transition-all hover:shadow-sm ${
                    active
                      ? 'border-purple-300 bg-purple-50'
                      : 'border-border bg-surface hover:bg-purple-50/50'
                  }`}
                >
                  <button
                    onClick={() => selectTest(t.id)}
                    className="block w-full pr-8 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-purple-800">
                        Test v{t.version_no}
                      </span>
                      <StatusChip status={t.status} />
                    </div>
                    <p className="mt-1 text-xs text-ink-500">
                      {t.total} questions · {t.likert} likert · {t.free_text} reflection
                    </p>
                  </button>
                  <button
                    onClick={() => setPendingDelete(t)}
                    disabled={busy}
                    className="absolute right-2 top-2 rounded-md p-1.5 text-ink-400 opacity-0 transition-all hover:bg-danger-soft hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
                    aria-label={`Delete Test v${t.version_no}`}
                    title="Delete test"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Selected test detail */}
          {detail && (
            <div className="space-y-5">
              <Card tone="base" className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-display font-bold text-purple-800">
                      Test v{detail.version_no}
                    </h2>
                    <StatusChip status={detail.status} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={exportTest} disabled={!detail.items.length}>
                      <Download className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                      Export
                    </Button>
                    <Button
                      variant={isPublished ? 'ghost' : 'purple'}
                      onClick={togglePublish}
                      disabled={busy || (!isPublished && detail.items.length === 0)}
                    >
                      {isPublished ? 'Unpublish' : 'Publish'}
                    </Button>
                  </div>
                </div>

                {/* Structure hint */}
                <div
                  className={`rounded-md border p-3 text-sm ${
                    isCanonical
                      ? 'border-success/30 bg-success-soft text-success'
                      : 'border-warning/30 bg-warning-soft text-warning'
                  }`}
                >
                  {likertCount}/27 likert questions.{' '}
                  {isCanonical
                    ? 'Matches the scorer’s expected structure.'
                    : 'The scorer needs 27 likert items (5/5/5/5/5/2 across the 6 domains) to compute results.'}
                </div>
              </Card>

              {/* Add question */}
              {isPublished ? (
                <Card tone="base">
                  <p className="text-sm text-ink-500">
                    Published tests are locked. Unpublish to edit, or create a new version.
                  </p>
                </Card>
              ) : (
                <Card tone="base" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-purple-800">
                      {editingId != null ? `Edit question #${editingId}` : 'Add a question'}
                    </h3>
                    {editingId != null && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="text-xs font-medium text-ink-500 hover:text-ink-700"
                      >
                        Cancel edit
                      </button>
                    )}
                  </div>
                  <form onSubmit={submitQuestion} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-ink-700">
                        Question text
                      </label>
                      <Input
                        value={qText}
                        onChange={(e) => setQText(e.target.value)}
                        placeholder="e.g. I stay calm when a deal falls through."
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-ink-700">
                          Type
                        </label>
                        <Select
                          value={qType}
                          onChange={(e) => setQType(e.target.value as any)}
                        >
                          <option value="likert">Likert (1–5)</option>
                          <option value="free_text">Reflection (free text)</option>
                        </Select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-ink-700">
                          Domain
                        </label>
                        <Select
                          value={qDomain}
                          onChange={(e) => setQDomain(Number(e.target.value))}
                          disabled={qType === 'free_text'}
                        >
                          {DOMAINS.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.id}. {d.name}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <label className="flex h-11 items-center gap-2 text-sm text-ink-700">
                          <input
                            type="checkbox"
                            checked={qReverse}
                            disabled={qType === 'free_text'}
                            onChange={(e) => setQReverse(e.target.checked)}
                            className="h-4 w-4 accent-purple-600"
                          />
                          Reverse-scored
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" variant="primary" disabled={busy}>
                        {busy
                          ? 'Saving…'
                          : editingId != null
                          ? 'Save changes'
                          : 'Add question'}
                      </Button>
                      {editingId != null && (
                        <Button type="button" variant="ghost" onClick={resetForm} disabled={busy}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </Card>
              )}

              {/* Question list */}
              <Card tone="base" className="!p-0 overflow-hidden">
                {detail.items.length === 0 ? (
                  <p className="p-6 text-center text-sm text-ink-500">
                    No questions yet. Add your first question above.
                  </p>
                ) : (
                  <ul className="divide-y divide-ink-100">
                    {detail.items.map((q) => {
                      const isEditing = editingId === q.id
                      return (
                        <li
                          key={q.id}
                          className={`flex items-start gap-3 p-4 transition-colors ${
                            isEditing ? 'bg-purple-50/60' : 'hover:bg-ink-50'
                          }`}
                        >
                          <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-50 text-xs font-bold text-purple-700">
                            {q.id}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-ink-700">{q.text}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-500">
                              <span className="rounded bg-ink-100 px-1.5 py-0.5">
                                {q.type === 'free_text' ? 'Reflection' : q.domain_name}
                              </span>
                              <span>{q.type === 'free_text' ? 'free text' : 'likert 1–5'}</span>
                              {q.reverse && (
                                <span className="rounded bg-gold-100 px-1.5 py-0.5 text-gold-600">
                                  reverse
                                </span>
                              )}
                            </div>
                          </div>
                          {!isPublished && (
                            <div className="flex flex-shrink-0 items-center gap-1">
                              <button
                                onClick={() => startEdit(q)}
                                disabled={busy}
                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-purple-600 hover:bg-purple-50"
                                aria-label={`Edit question ${q.id}`}
                              >
                                <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                                Edit
                              </button>
                              <button
                                onClick={() => deleteQuestion(q.id)}
                                disabled={busy}
                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-danger hover:bg-danger-soft"
                                aria-label={`Delete question ${q.id}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                                Delete
                              </button>
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Delete-test confirmation */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4 animate-fade-in"
          onClick={() => setPendingDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-lg animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-soft text-danger">
                  <Trash2 className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                </span>
                <h3 className="text-lg font-display font-bold text-ink-700">Delete test?</h3>
              </div>
              <button
                onClick={() => setPendingDelete(null)}
                className="rounded-md p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
            <p className="text-sm text-ink-500">
              This permanently removes{' '}
              <span className="font-semibold text-ink-700">Test v{pendingDelete.version_no}</span>{' '}
              and all {pendingDelete.total} of its questions. This cannot be undone.
            </p>
            {pendingDelete.status === 'published' && (
              <p className="mt-3 rounded-md border border-warning/30 bg-warning-soft p-2.5 text-xs text-warning">
                This test is currently published. Deleting it will remove it from the live assessment.
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setPendingDelete(null)} disabled={busy}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDeleteTest} disabled={busy}>
                <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                {busy ? 'Deleting…' : 'Delete test'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
