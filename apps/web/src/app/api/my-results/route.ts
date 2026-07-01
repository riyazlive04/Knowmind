import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/my-results  { contact }
// Lets a returning respondent pull up their most recent assessment result by
// email or phone. Anon has no SELECT on `member` / `submission` (RLS), so this
// runs with the service-role key and only ever returns that one person's
// latest submission — never a list.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const { contact } = await request.json()
    const value = (contact ?? '').toString().trim()
    if (!value) {
      return NextResponse.json({ error: 'Enter your email or phone number.' }, { status: 400 })
    }

    let supabase
    try {
      supabase = createServiceClient()
    } catch {
      return NextResponse.json(
        { error: 'Result lookup is not configured on the server (missing service-role key).' },
        { status: 500 }
      )
    }

    // Resolve matching members by email (exact) or phone (digit suffix match,
    // since numbers are stored E.164 with a country code).
    let memberQuery = supabase.from('member').select('id, name')
    if (EMAIL_RE.test(value)) {
      memberQuery = memberQuery.ilike('email', value)
    } else {
      const digits = value.replace(/\D/g, '')
      if (digits.length < 6) {
        return NextResponse.json(
          { error: 'Enter a valid email or phone number.' },
          { status: 400 }
        )
      }
      memberQuery = memberQuery.ilike('phone', `%${digits}`)
    }

    const { data: members, error: memberErr } = await memberQuery
    if (memberErr) {
      return NextResponse.json({ error: memberErr.message }, { status: 500 })
    }
    if (!members || members.length === 0) {
      return NextResponse.json(
        { error: 'We couldn’t find any assessment for that email or phone. Double-check it, or take the assessment.' },
        { status: 404 }
      )
    }

    const memberIds = members.map((m: any) => m.id)

    // Most recent submission across the matched member(s).
    const { data: subs, error: subErr } = await supabase
      .from('submission')
      .select('*')
      .in('member_id', memberIds)
      .order('created_at', { ascending: false })
      .limit(1)

    if (subErr) {
      return NextResponse.json({ error: subErr.message }, { status: 500 })
    }
    if (!subs || subs.length === 0) {
      return NextResponse.json(
        { error: 'We found your details but no completed assessment yet. Take the assessment to see your profile.' },
        { status: 404 }
      )
    }

    const sub = subs[0]
    const owner = members.find((m: any) => m.id === sub.member_id) ?? members[0]

    return NextResponse.json({
      name: owner?.name ?? null,
      takenAt: sub.created_at ?? null,
      rawAnswers: Array.isArray(sub.raw_answers) ? sub.raw_answers : null,
      // Fallback if raw answers weren't stored: use the persisted score fields.
      fallback: {
        overall: sub.overall ?? null,
        domainScores: sub.domain_scores ?? null,
        personalCompetence: sub.personal_competence ?? null,
        socialCompetence: sub.social_competence ?? null,
      },
    })
  } catch (err: any) {
    console.error('POST /api/my-results error:', err)
    return NextResponse.json({ error: err.message || 'Lookup failed' }, { status: 500 })
  }
}
