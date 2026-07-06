import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@knowmind/db'

// POST /api/reports/[id]/save
// Body: { personalNote, whatYouShared, actionPlan, changedFields }
// Saves editor changes and moves the report into the "Edited" state.
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id
    const { personalNote, whatYouShared, actionPlan } = await request.json()

    // Reject edits to locked reports.
    const current = await prisma.report.findUnique({
      where: { id: reportId },
      select: { state: true },
    })
    if (!current) return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    if (current.state === 'Approved' || current.state === 'Sent') {
      return NextResponse.json(
        { error: 'This report is locked and can no longer be edited.' },
        { status: 409 }
      )
    }

    const data = await prisma.report.update({
      where: { id: reportId },
      data: {
        personal_note: personalNote ?? '',
        what_you_shared: whatYouShared ?? '',
        action_plan: actionPlan ?? '',
        state: 'Edited',
      },
    })

    return NextResponse.json({ success: true, report: data })
  } catch (err: any) {
    console.error('POST /api/reports/[id]/save error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
