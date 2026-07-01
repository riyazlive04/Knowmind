'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, TriangleAlert } from 'lucide-react'
import { Button, Card } from '@/components/ui'

interface Question {
  id: number
  text: string
  domain?: number
  domain_name?: string
  type?: string
  reverse?: boolean
  placeholder?: string
}

interface AssessmentFormProps {
  questionVersion: { id: string; items: Question[] }
  onSubmit: (answers: number[], freeText: Record<string, string>) => void
  isLoading: boolean
}

type Step =
  | { type: 'domain'; id: number; name: string; items: Question[] }
  | { type: 'reflection'; id: -1; name: string; items: Question[] }

const SCALE = [
  { v: 1, label: 'Strongly disagree' },
  { v: 2, label: 'Disagree' },
  { v: 3, label: 'Neutral' },
  { v: 4, label: 'Agree' },
  { v: 5, label: 'Strongly agree' },
]

export default function AssessmentForm({
  questionVersion,
  onSubmit,
  isLoading,
}: AssessmentFormProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [freeText, setFreeText] = useState<Record<number, string>>({})
  const [stepIndex, setStepIndex] = useState(0)
  const [direction, setDirection] = useState<'fwd' | 'back'>('fwd')
  const [modalMsg, setModalMsg] = useState<string | null>(null)
  const [highlightId, setHighlightId] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)

  const likertItems = useMemo(
    () => questionVersion.items.filter((q) => typeof q.id === 'number' && q.id <= 27),
    [questionVersion]
  )
  const freeTextItems = useMemo(
    () => questionVersion.items.filter((q) => typeof q.id === 'number' && q.id > 27),
    [questionVersion]
  )

  const steps = useMemo<Step[]>(() => {
    const map = new Map<number, { id: number; name: string; items: Question[] }>()
    for (const q of likertItems) {
      const d = q.domain || 0
      if (!map.has(d)) map.set(d, { id: d, name: q.domain_name || 'Domain', items: [] })
      map.get(d)!.items.push(q)
    }
    const domainSteps: Step[] = Array.from(map.values())
      .sort((a, b) => a.id - b.id)
      .map((d) => ({ type: 'domain', ...d }))
    if (freeTextItems.length > 0) {
      domainSteps.push({ type: 'reflection', id: -1, name: 'Reflection', items: freeTextItems })
    }
    return domainSteps
  }, [likertItems, freeTextItems])

  const totalLikert = likertItems.length
  const step = steps[stepIndex]
  const isLast = stepIndex === steps.length - 1
  const answeredCount = Object.keys(answers).length
  const progress = Math.round((answeredCount / (totalLikert || 1)) * 100)

  const firstUnansweredIn = (items: Question[]) => {
    for (const q of items) if (answers[q.id] == null) return q.id
    return null
  }
  const locateFirstUnanswered = () => {
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i]
      if (s.type === 'domain') {
        const id = firstUnansweredIn(s.items)
        if (id != null) return { stepIndex: i, id }
      }
    }
    return null
  }

  // Scroll the step into view on change
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [stepIndex])

  // Scroll to (and flash) the highlighted unanswered question
  useEffect(() => {
    if (highlightId == null) return
    const t = setTimeout(() => {
      document
        .querySelector(`[data-qid="${highlightId}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 60)
    return () => clearTimeout(t)
  }, [highlightId, stepIndex])

  function select(qid: number, value: number) {
    setAnswers((a) => ({ ...a, [qid]: value }))
    if (highlightId === qid) setHighlightId(null)
  }

  function goNext() {
    if (step.type === 'domain') {
      const missing = firstUnansweredIn(step.items)
      if (missing != null) {
        setHighlightId(missing)
        setModalMsg('Please answer every question in this section before you continue.')
        return
      }
    }
    if (isLast) {
      handleSubmit()
      return
    }
    setDirection('fwd')
    setHighlightId(null)
    setStepIndex((i) => i + 1)
  }

  function goBack() {
    if (stepIndex === 0) return
    setDirection('back')
    setHighlightId(null)
    setStepIndex((i) => i - 1)
  }

  function handleSubmit() {
    const loc = locateFirstUnanswered()
    if (loc) {
      setDirection(loc.stepIndex < stepIndex ? 'back' : 'fwd')
      setStepIndex(loc.stepIndex)
      setHighlightId(loc.id)
      setModalMsg("You still have an unanswered question — we've taken you to it. Answer it to get your results.")
      return
    }
    const rawAnswers = Array(totalLikert)
      .fill(0)
      .map((_, i) => answers[i + 1] || 0)
    setSubmitted(true)
    onSubmit(rawAnswers, freeText)
  }

  return (
    <div className="animate-fade-in">
      {/* Progress header */}
      <div ref={topRef} className="scroll-mt-4 mb-6 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-purple-700">
            Step {stepIndex + 1} of {steps.length}
          </span>
          <span className="text-ink-400">
            {answeredCount}/{totalLikert} answered
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-purple-50">
          <div
            className="h-full rounded-full bg-grad-accent transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex gap-1.5">
          {steps.map((s, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i < stepIndex ? 'bg-purple-500' : i === stepIndex ? 'bg-gold-400' : 'bg-ink-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step content (re-mounts per step to animate) */}
      <div
        key={stepIndex}
        className={direction === 'back' ? 'animate-step-in-back' : 'animate-step-in'}
      >
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">
            {step.type === 'reflection' ? 'Almost done' : `Domain ${stepIndex + 1}`}
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold text-purple-800">{step.name}</h2>
          {step.type === 'domain' && (
            <p className="mt-1 text-sm text-ink-500">
              Rate how much you agree with each statement.
            </p>
          )}
          {step.type === 'reflection' && (
            <p className="mt-1 text-sm text-ink-500">
              Optional — a few words help make your report more personal.
            </p>
          )}
        </div>

        {step.type === 'domain' ? (
          <div className="space-y-4">
            {step.items.map((question, idx) => {
              const highlighted = highlightId === question.id
              return (
                <Card
                  key={question.id}
                  data-qid={question.id}
                  tone="base"
                  className={`space-y-4 transition-all duration-200 ${
                    highlighted ? 'ring-2 ring-danger shadow-md' : ''
                  }`}
                  style={{ animationDelay: `${idx * 45}ms` }}
                >
                  <label className="block text-base font-medium text-ink-700">
                    {question.text}
                    {question.reverse && (
                      <span className="ml-2 rounded-sm bg-gold-100 px-2 py-1 text-xs text-gold-600">
                        Reverse-scored
                      </span>
                    )}
                  </label>

                  <div>
                    <div className="grid grid-cols-5 gap-2">
                      {SCALE.map(({ v, label }) => {
                        const sel = answers[question.id] === v
                        return (
                          <button
                            type="button"
                            key={v}
                            onClick={() => select(question.id, v)}
                            aria-label={`${v} — ${label}`}
                            aria-pressed={sel}
                            className={`press flex flex-col items-center justify-center rounded-xl border-2 py-3 font-display text-lg font-bold transition-all duration-150 ${
                              sel
                                ? 'scale-[1.03] border-transparent bg-grad-accent text-purple-900 shadow-sm'
                                : 'border-ink-200 bg-white text-ink-500 hover:border-purple-300 hover:bg-purple-50/60'
                            }`}
                          >
                            {v}
                          </button>
                        )
                      })}
                    </div>
                    <div className="mt-1.5 flex justify-between text-[11px] text-ink-400">
                      <span>Strongly disagree</span>
                      <span>Strongly agree</span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {step.items.map((question, idx) => (
              <Card
                key={question.id}
                tone="base"
                className="space-y-3"
                style={{ animationDelay: `${idx * 45}ms` }}
              >
                <label className="block text-base font-medium text-ink-700">{question.text}</label>
                <textarea
                  value={freeText[question.id] || ''}
                  onChange={(e) =>
                    setFreeText({ ...freeText, [question.id]: e.target.value })
                  }
                  placeholder={question.placeholder || 'Share your thoughts…'}
                  className="w-full rounded-md border border-ink-200 bg-white px-3.5 py-3 text-ink-700 outline-none transition-all placeholder:text-ink-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                  rows={3}
                />
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="mt-8 flex items-center gap-3">
        {stepIndex > 0 && (
          <Button type="button" variant="ghost" onClick={goBack} className="press">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
        )}
        <div className="flex-1" />
        <Button
          type="button"
          variant="primary"
          onClick={goNext}
          disabled={isLoading || submitted}
          className="press px-8"
        >
          {isLast
            ? isLoading
              ? 'Submitting…'
              : submitted
                ? 'Submitted!'
                : 'Get my results'
            : 'Continue'}
          {!isLoading && !submitted && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </div>

      {/* Validation popup */}
      {modalMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="animate-fade-in absolute inset-0 bg-purple-900/40 backdrop-blur-sm"
            onClick={() => setModalMsg(null)}
          />
          <div className="animate-scale-in relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-warning-soft text-warning">
              <TriangleAlert className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="font-display text-lg font-bold text-purple-800">Hold on</h3>
            <p className="mt-2 text-sm text-ink-500">{modalMsg}</p>
            <Button
              variant="primary"
              className="press mt-5 w-full"
              onClick={() => setModalMsg(null)}
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
