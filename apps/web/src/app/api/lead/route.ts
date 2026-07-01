import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/lead
// Captures a prospective respondent (name, email, phone + country code) BEFORE
// the assessment and returns their member id so the submission can be linked.
//
// Anon cannot write to `member` (RLS: SELECT-only, see migration 006), so this
// runs with the service-role key. Member is keyed by phone (UNIQUE): an existing
// person re-taking the assessment updates their contact fields without losing
// their status; a new person is created as a lead.

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

    let supabase
    try {
      supabase = createServiceClient()
    } catch (e: any) {
      console.error('Lead route misconfigured:', e.message)
      return NextResponse.json(
        { error: 'Lead capture is not configured on the server (missing service-role key).' },
        { status: 500 }
      )
    }

    // Find existing member by phone (UNIQUE) — update contact, keep status.
    const { data: existing, error: findError } = await supabase
      .from('member')
      .select('id')
      .eq('phone', phone)
      .maybeSingle()

    if (findError) {
      console.error('Lead lookup error:', findError)
      return NextResponse.json({ error: findError.message }, { status: 500 })
    }

    if (existing) {
      const { data, error } = await supabase
        .from('member')
        .update({
          name,
          email,
          country_code: countryCode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select('id')
        .single()

      if (error) {
        console.error('Lead update error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ memberId: data.id, created: false })
    }

    const { data, error } = await supabase
      .from('member')
      .insert([
        {
          name,
          email,
          phone,
          country_code: countryCode,
          status: 'lead',
        },
      ])
      .select('id')
      .single()

    if (error) {
      console.error('Lead insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ memberId: data.id, created: true })
  } catch (err: any) {
    console.error('POST /api/lead error:', err)
    return NextResponse.json({ error: err.message || 'Failed to capture lead' }, { status: 500 })
  }
}
