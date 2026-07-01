'use client'

import { FormEvent, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button, Card, Input } from '@/components/ui'
import CountryCodeSelect from './CountryCodeSelect'

export interface LeadDetails {
  name: string
  email: string
  countryCode: string
  phone: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LeadCaptureForm({
  onSubmitted,
}: {
  onSubmitted: (memberId: string, lead: LeadDetails) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [countryCode, setCountryCode] = useState('+91')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  function validate(): Record<string, string> {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Please enter your name'
    if (!email.trim()) e.email = 'Please enter your email'
    else if (!EMAIL_RE.test(email.trim())) e.email = 'Enter a valid email address'
    if (!phone.trim()) e.phone = 'Please enter your phone number'
    else if (phone.replace(/\D/g, '').length < 6) e.phone = 'Enter a valid phone number'
    return e
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault()
    setServerError('')
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return

    try {
      setSubmitting(true)
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          countryCode,
          phone: phone.trim(),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data?.fields) setErrors(data.fields)
        setServerError(data?.error || 'Something went wrong. Please try again.')
        return
      }

      onSubmitted(data.memberId, {
        name: name.trim(),
        email: email.trim(),
        countryCode,
        phone: phone.trim(),
      })
    } catch {
      setServerError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass = (key: string) =>
    errors[key] ? '!border-danger focus:!ring-danger-soft' : ''

  return (
    <div className="mx-auto max-w-lg animate-fade-in-up">
      <Card tone="base" className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-display font-bold text-purple-800">
            Before we begin
          </h2>
          <p className="text-sm text-ink-500">
            Tell us where to send your emotional intelligence profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="lead-name" className="block text-sm font-semibold text-ink-700">
              Full name
            </label>
            <Input
              id="lead-name"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="lead-email" className="block text-sm font-semibold text-ink-700">
              Email
            </label>
            <Input
              id="lead-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-xs text-danger">{errors.email}</p>}
          </div>

          {/* Phone with country code */}
          <div className="space-y-1.5">
            <label htmlFor="lead-phone" className="block text-sm font-semibold text-ink-700">
              Phone number
            </label>
            <div className="flex gap-2">
              <CountryCodeSelect value={countryCode} onChange={setCountryCode} />
              <Input
                id="lead-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`flex-1 ${fieldClass('phone')}`}
                aria-invalid={!!errors.phone}
              />
            </div>
            {errors.phone && <p className="text-xs text-danger">{errors.phone}</p>}
            <p className="text-xs text-ink-400">
              We&apos;ll send your results to {countryCode} {phone || '…'}
            </p>
          </div>

          {serverError && (
            <div className="rounded-md border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
              {serverError}
            </div>
          )}

          <Button type="submit" variant="primary" disabled={submitting} className="w-full">
            {submitting ? (
              'Saving…'
            ) : (
              <>
                Start Assessment
                <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </>
            )}
          </Button>

          <p className="text-center text-xs text-ink-400">
            Your details stay private and are used only to deliver your results.
          </p>
        </form>
      </Card>
    </div>
  )
}
