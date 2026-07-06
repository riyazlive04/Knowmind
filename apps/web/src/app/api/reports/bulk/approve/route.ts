import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@knowmind/db'

// POST /api/reports/bulk/approve  { reportIds: string[] }
// Marks the given reports as Approved (locks them from further editing).
export async function POST(request: NextRequest) {
  try {
    const { reportIds } = await request.json()

    if (!Array.isArray(reportIds) || reportIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No reports selected' },
        { status: 400 }
      )
    }

    // Don't re-approve reports that are already locked/sent.
    const result = await prisma.report.updateMany({
      where: { id: { in: reportIds }, state: { notIn: ['Approved', 'Sent'] } },
      data: { state: 'Approved' },
    })

    const approved = result.count
    const skipped = reportIds.length - approved
    return NextResponse.json({
      success: true,
      approved,
      message:
        skipped > 0
          ? `Approved ${approved} report${approved === 1 ? '' : 's'} (${skipped} already approved/sent).`
          : `Approved ${approved} report${approved === 1 ? '' : 's'}.`,
    })
  } catch (err: any) {
    console.error('POST /api/reports/bulk/approve error:', err)
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}
