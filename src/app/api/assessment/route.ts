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
    const { data: submission, error: subError } = await supabase
      .from('submission')
      .insert([
        {
          round: 'pre',
          question_version_id: questionVersion.id,
          raw_answers: rawAnswers,
          domain_scores: scores.domainScores,
          overall: scores.overall,
          personal_competence: scores.personalCompetence,
          social_competence: scores.socialCompetence,
          free_text: freeText,
        },
      ])
      .select()

    if (subError) {
      console.error('Submission insert error:', subError)
      throw subError
    }

    if (!submission || submission.length === 0) {
      throw new Error('Failed to create submission')
    }

    return NextResponse.json({
      submission: submission[0],
      scores
    })
  } catch (err: any) {
    console.error('POST /api/assessment error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to submit assessment' },
      { status: 500 }
    )
  }
}
