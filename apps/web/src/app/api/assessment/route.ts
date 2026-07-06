import { prisma, Prisma } from '@knowmind/db'
import { scoreSubmission } from '@/lib/scoring'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get latest published question version
    const questionVersion = await prisma.questionVersion.findFirst({
      where: { status: 'published' },
      orderBy: { version_no: 'desc' },
    })

    if (!questionVersion) {
      return NextResponse.json(
        { error: 'No published question version found' },
        { status: 404 }
      )
    }

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
    const { rawAnswers, freeText, memberId } = body

    // Get latest published question version
    const questionVersion = await prisma.questionVersion.findFirst({
      where: { status: 'published' },
      orderBy: { version_no: 'desc' },
    })

    if (!questionVersion) {
      return NextResponse.json(
        { error: 'No published question version found' },
        { status: 404 }
      )
    }

    // Score the submission
    const scores = scoreSubmission(rawAnswers)

    // Store submission
    const submissionPayload = {
      member_id: memberId ?? null,
      round: 'pre',
      question_version_id: questionVersion.id,
      raw_answers: rawAnswers ?? Prisma.DbNull,
      domain_scores: scores.domainScores,
      overall: scores.overall,
      personal_competence: scores.personalCompetence,
      social_competence: scores.socialCompetence,
      free_text: freeText ?? Prisma.DbNull,
    }

    const submission = await prisma.submission.create({ data: submissionPayload })

    return NextResponse.json({
      submission,
      scores,
    })
  } catch (err: any) {
    console.error('SUBMIT ERROR:', err?.message, err)
    return NextResponse.json(
      { error: err.message || 'Failed to submit assessment' },
      { status: 500 }
    )
  }
}
