import { prisma } from '@knowmind/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch all members with their latest submission
    const members = await prisma.member.findMany({ orderBy: { created_at: 'desc' } })

    // Fetch pre-round submissions (most recent first) to pair with each member
    const submissions = await prisma.submission.findMany({
      where: { round: 'pre' },
      select: { member_id: true, overall: true, domain_scores: true },
      orderBy: { created_at: 'desc' },
    })

    // Create a map of the latest submission per member
    const latestSubmissionMap = new Map<string, any>()
    submissions.forEach((sub) => {
      if (sub.member_id && !latestSubmissionMap.has(sub.member_id)) {
        latestSubmissionMap.set(sub.member_id, sub)
      }
    })

    // Combine members with their submissions
    const enrichedMembers = members.map((member) => ({
      ...member,
      submission: latestSubmissionMap.get(member.id),
    }))

    // Calculate cohort statistics
    const submissions_list = Array.from(latestSubmissionMap.values())
    let cohortStats = null

    if (submissions_list.length > 0) {
      const overallScores = submissions_list.map((s: any) => s.overall)
      const average = overallScores.reduce((a: number, b: number) => a + b, 0) / overallScores.length

      // Calculate domain averages
      const domainNames = [
        'Self-Awareness',
        'Self-Regulation',
        'Motivation',
        'Empathy',
        'Social & Leadership',
        'Relationship Intelligence',
      ]

      const domainAverages: Record<string, number> = {}
      for (const domain of domainNames) {
        const scores = submissions_list
          .map((s: any) => s.domain_scores?.[domain] || 0)
          .filter((v) => v > 0)
        domainAverages[domain] = scores.reduce((a: number, b: number) => a + b, 0) / scores.length
      }

      const weakestDomain = Object.entries(domainAverages).reduce((a, b) =>
        a[1] < b[1] ? a : b
      )[0]

      cohortStats = {
        count: enrichedMembers.length,
        average: parseFloat(average.toFixed(2)),
        weakestDomain,
        domainAverages: Object.fromEntries(
          Object.entries(domainAverages).map(([k, v]) => [k, parseFloat(v.toFixed(2))])
        ),
      }
    }

    return NextResponse.json({
      members: enrichedMembers,
      cohortStats,
    })
  } catch (err: any) {
    console.error('GET /api/members error:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch members' }, { status: 500 })
  }
}
