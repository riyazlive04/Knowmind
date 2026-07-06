import { prisma } from '@knowmind/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const submissionId = searchParams.get('id')

    if (submissionId) {
      // Get single submission with member details
      const submission = await prisma.submission.findUnique({ where: { id: submissionId } })

      if (!submission) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
      }

      // Get member details
      const member = submission.member_id
        ? await prisma.member.findUnique({ where: { id: submission.member_id } })
        : null

      return NextResponse.json({
        submission,
        member,
      })
    }

    // List all submissions with filters
    const round = searchParams.get('round')
    const memberName = searchParams.get('memberName')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
    const page = parseInt(searchParams.get('page') || '0')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    const where = round ? { round } : {}

    const [submissions, count] = await Promise.all([
      prisma.submission.findMany({
        where,
        select: { id: true, member_id: true, round: true, overall: true, created_at: true },
        orderBy: { [sortBy]: sortOrder } as any,
        skip: page * pageSize,
        take: pageSize,
      }),
      prisma.submission.count({ where }),
    ])

    // Get member details for all submissions
    const memberIds = submissions
      .map((s) => s.member_id)
      .filter((id): id is string => Boolean(id))
    const members = await prisma.member.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, name: true },
    })

    const memberMap = new Map(members.map((m) => [m.id, m.name]))

    // Enrich submissions with member names and EI band
    const enrichedSubmissions = submissions.map((sub: any) => {
      let band = 'Needs Support'
      if (sub.overall >= 4.0) band = 'High'
      else if (sub.overall >= 3.0) band = 'Moderate'

      return {
        ...sub,
        member_name: (sub.member_id && memberMap.get(sub.member_id)) || 'Unknown',
        ei_band: band,
      }
    })

    // Client-side filter by member name if provided
    let filtered = enrichedSubmissions
    if (memberName) {
      filtered = filtered.filter((s: any) =>
        s.member_name.toLowerCase().includes(memberName.toLowerCase())
      )
    }

    return NextResponse.json({
      submissions: filtered,
      total: count || 0,
      page,
      pageSize,
    })
  } catch (err: any) {
    console.error('GET /api/submissions error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
