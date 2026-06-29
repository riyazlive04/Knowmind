import { createClient } from '@/lib/supabase/server'
import { scoreSubmission } from '@/lib/scoring'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get published question version
    const { data: questionVersion, error } = await supabase
      .from('question_version')
      .select('*')
      .eq('status', 'published')
      .order('version_no', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error

    return NextResponse.json({ questionVersion })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
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
    const { data: questionVersion, error: qvError } = await supabase
      .from('question_version')
      .select('*')
      .eq('status', 'published')
      .order('version_no', { ascending: false })
      .limit(1)
      .single()

    if (qvError) throw qvError

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
      .single()

    if (subError) throw subError

    return NextResponse.json({
      submission,
      scores
    })
  } catch (err: any) {
    console.error('Assessment submission error:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
