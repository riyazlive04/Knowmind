import { createClient } from '@/lib/supabase/server'
import { scoreSubmission } from '@/lib/scoring'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get published question version - remove .single() and handle manually
    const { data, error } = await supabase
      .from('question_version')
      .select('*')
      .eq('status', 'published')
      .order('version_no', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No published question version found' },
        { status: 404 }
      )
    }

    const questionVersion = data[0]

    return NextResponse.json({ questionVersion })
  } catch (err: any) {
    console.error('GET /api/assessment error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to load assessment' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rawAnswers, freeText } = body

    const supabase = createClient()

    // Get latest published question version
    const { data: qvData, error: qvError } = await supabase
      .from('question_version')
      .select('*')
      .eq('status', 'published')
      .order('version_no', { ascending: false })
      .limit(1)

    if (qvError) {
      console.error('Supabase query error:', qvError)
      throw qvError
    }

    if (!qvData || qvData.length === 0) {
      return NextResponse.json(
        { error: 'No published question version found' },
        { status: 404 }
      )
    }

    const questionVersion = qvData[0]

    // Score the submission
    const scores = scoreSubmission(rawAnswers)

    // Store submission (anon key allows insert)
    // Do NOT use .select() - anon cannot SELECT submissions, only INSERT them
    const submissionPayload = {
      round: 'pre',
      question_version_id: questionVersion.id,
      raw_answers: rawAnswers,
      domain_scores: scores.domainScores,
      overall: scores.overall,
      personal_competence: scores.personalCompetence,
      social_competence: scores.socialCompetence,
      free_text: freeText,
    }

    const { error: subError } = await supabase
      .from('submission')
      .insert([submissionPayload])

    if (subError) {
      console.error('SUBMIT ERROR:', JSON.stringify(subError, null, 2))
      console.error('error.code:', subError.code)
      console.error('error.message:', subError.message)
      console.error('error.details:', subError.details)
      console.error('error.hint:', subError.hint)
      throw subError
    }

    return NextResponse.json({
      submission: submissionPayload,
      scores
    })
  } catch (err: any) {
    console.error('SUBMIT ERROR:', JSON.stringify(err, null, 2))
    console.error('error.code:', err.code)
    console.error('error.message:', err.message)
    console.error('error.details:', err.details)
    console.error('error.hint:', err.hint)
    return NextResponse.json(
      { error: err.message || 'Failed to submit assessment' },
      { status: 500 }
    )
  }
}
