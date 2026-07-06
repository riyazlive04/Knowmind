import { prisma } from '@knowmind/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/lead
// Captures a prospective respondent (name, email, phone + country code) BEFORE
// the assessment and returns their member id so the submission can be linked.
//
// Member is keyed by phone (UNIQUE): an existing person re-taking the assessment
// updates their contact fields without losing their status; a new person is
// created as a lead.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function toE164(countryCode: string, phone: string): string {
  const cc = countryCode.trim().replace(/[^\d+]/g, '') // keep digits and +
  const national = phone.replace(/\D/g, '') // digits only
  const dial = cc.startsWith('+') ? cc : `+${cc}`
  return `${dial}${national}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = (body.name ?? '').toString().trim()
    const email = (body.email ?? '').toString().trim()
    const countryCode = (body.countryCode ?? '').toString().trim()
    const phoneRaw = (body.phone ?? '').toString().trim()

    // --- Validation ---
    const errors: Record<string, string> = {}
    if (!name) errors.name = 'Name is required'
    if (!email) errors.email = 'Email is required'
    else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email'
    if (!countryCode) errors.countryCode = 'Country code is required'
    if (!phoneRaw) errors.phone = 'Phone number is required'
    else if (phoneRaw.replace(/\D/g, '').length < 6)
      errors.phone = 'Enter a valid phone number'

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', fields: errors }, { status: 400 })
    }

    const phone = toE164(countryCode, phoneRaw)

    // Find existing member by phone (UNIQUE) — update contact, keep status.
    const existing = await prisma.member.findUnique({
      where: { phone },
      select: { id: true },
    })

    if (existing) {
      const data = await prisma.member.update({
        where: { id: existing.id },
        data: { name, email, country_code: countryCode },
        select: { id: true },
      })
      return NextResponse.json({ memberId: data.id, created: false })
    }

    const data = await prisma.member.create({
      data: { name, email, phone, country_code: countryCode, status: 'lead' },
      select: { id: true },
    })

    return NextResponse.json({ memberId: data.id, created: true })
  } catch (err: any) {
    console.error('POST /api/lead error:', err)
    return NextResponse.json({ error: err.message || 'Failed to capture lead' }, { status: 500 })
  }
}
