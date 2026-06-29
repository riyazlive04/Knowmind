'use client'

import { FormEvent, useState } from 'react'

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
  questionVersion: {
    id: string
    items: Question[]
  }
  onSubmit: (answers: number[], freeText: Record<string, string>) => void
  isLoading: boolean
}

export default function AssessmentForm({
  questionVersion,
  onSubmit,
  isLoading,
}: AssessmentFormProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [freeText, setFreeText] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const likertItems = questionVersion.items.filter(
    (q) => typeof q.id === 'number' && q.id <= 27
  )
  const freeTextItems = questionVersion.items.filter(
    (q) => typeof q.id === 'number' && q.id > 27
  )

  const groupedByDomain = likertItems.reduce(
    (acc, q) => {
      if (!acc[q.domain || 0]) {
        acc[q.domain || 0] = {
          name: q.domain_name || 'Domain',
          items: [],
        }
      }
      acc[q.domain || 0].items.push(q)
      return acc
    },
    {} as Record<number, { name: string; items: Question[] }>
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    // Check all answers filled
    if (Object.keys(answers).length < 27) {
      alert('Please answer all 27 questions')
      return
    }

    // Convert to array (1-indexed)
    const rawAnswers = Array(27)
      .fill(0)
      .map((_, i) => answers[i + 1] || 0)

    onSubmit(rawAnswers, freeText)
    setSubmitted(true)
  }

  const progress = (Object.keys(answers).length / 27) * 100

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* Progress bar */}
      <div className="bg-surface rounded-lg p-4 border border-border">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-text">Progress</span>
          <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-background rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Likert scale questions grouped by domain */}
      {Object.entries(groupedByDomain).map(([domainId, domain]) => (
        <div key={domainId} className="space-y-6">
          <div className="border-b-2 border-primary pb-3">
            <h2 className="text-2xl font-bold text-primary font-fraunces">
              {domain.name}
            </h2>
          </div>

          <div className="space-y-6">
            {domain.items.map((question) => (
              <div key={question.id} className="space-y-3">
                <label className="block text-base font-medium text-text">
                  {question.id}. {question.text}
                  {question.reverse && (
                    <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      Reverse-scored
                    </span>
                  )}
                </label>

                <div className="flex justify-between gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all"
                      style={{
                        borderColor: answers[question.id] === value ? 'var(--color-primary)' : 'var(--color-border)',
                        backgroundColor: answers[question.id] === value ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                      }}
                    >
                      <input
                        type="radio"
                        name={`q${question.id}`}
                        value={value}
                        checked={answers[question.id] === value}
                        onChange={(e) =>
                          setAnswers({
                            ...answers,
                            [question.id]: parseInt(e.target.value),
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="font-medium">{value}</span>
                      {value === 1 && <span className="text-xs text-text-muted">Strongly Disagree</span>}
                      {value === 5 && <span className="text-xs text-text-muted">Strongly Agree</span>}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Free-text questions */}
      {freeTextItems.length > 0 && (
        <div className="space-y-6">
          <div className="border-b-2 border-secondary pb-3">
            <h2 className="text-2xl font-bold text-secondary font-fraunces">
              Reflection Questions
            </h2>
          </div>

          {freeTextItems.map((question) => (
            <div key={question.id} className="space-y-3">
              <label className="block text-base font-medium text-text">
                {question.id}. {question.text}
              </label>
              <textarea
                value={freeText[question.id] || ''}
                onChange={(e) =>
                  setFreeText({
                    ...freeText,
                    [question.id]: e.target.value,
                  })
                }
                placeholder={question.placeholder || 'Share your thoughts...'}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-secondary"
                rows={3}
              />
            </div>
          ))}
        </div>
      )}

      {/* Submit button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading || submitted}
          className="flex-1 py-3 px-6 bg-primary text-primary-fg font-medium rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Submitting...' : submitted ? 'Submitted!' : 'Get My Results'}
        </button>
      </div>

      {submitted && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Thank you! Calculating your results...
        </div>
      )}
    </form>
  )
}
