import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@knowmind/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const reportId = searchParams.get('reportId')

    if (reportId) {
      // Load a single report by its own id (used by the editor).
      const report = await prisma.report.findUnique({ where: { id: reportId } })

      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 })
      }

      const member = await prisma.member.findUnique({ where: { id: report.member_id } })
      const submission = await prisma.submission.findUnique({
        where: { id: report.submission_id },
      })

      return NextResponse.json({ success: true, report, member, submission })
    }

    if (memberId) {
      // Get report for a specific member
      const report = await prisma.report.findFirst({
        where: { member_id: memberId },
        orderBy: { created_at: 'desc' },
      })

      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 })
      }

      // Get member and submission data
      const member = await prisma.member.findUnique({ where: { id: memberId } })
      const submission = await prisma.submission.findUnique({
        where: { id: report.submission_id },
      })

      return NextResponse.json({
        success: true,
        report,
        member,
        submission,
      })
    }

    // List all reports
    const reports = await prisma.report.findMany({ orderBy: { created_at: 'desc' } })

    // Get member names for reports
    const memberIds = reports.map((r) => r.member_id)
    const members = await prisma.member.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, name: true },
    })

    const memberMap = new Map(members.map((m) => [m.id, m.name]))

    const enrichedReports = reports.map((report) => ({
      ...report,
      member_name: memberMap.get(report.member_id) || 'Unknown',
    }))

    return NextResponse.json({
      success: true,
      reports: enrichedReports,
      total: enrichedReports.length,
    })
  } catch (err: any) {
    console.error('GET /api/reports error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, docxDir } = body

    if (action === 'generate') {
      // Call backend to generate reports
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'
      const response = await fetch(`${backendUrl}/api/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docxDir }),
      })

      const data = await response.json()

      if (!response.ok) {
        return NextResponse.json(data, { status: response.status })
      }

      return NextResponse.json({
        success: true,
        message: data.message,
        results: data.results,
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    console.error('POST /api/reports error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
