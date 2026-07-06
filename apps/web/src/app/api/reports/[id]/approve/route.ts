import { NextRequest, NextResponse } from 'next/server'
import { prisma, Prisma } from '@knowmind/db'

// POST /api/reports/[id]/approve
// Locks the report by moving it to the "Approved" state.
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id

    try {
      const data = await prisma.report.update({
        where: { id: reportId },
        data: { state: 'Approved' },
      })
      return NextResponse.json({ success: true, report: data })
    } catch (error) {
      // P2025 = record to update not found
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 })
      }
      throw error
    }
  } catch (err: any) {
    console.error('POST /api/reports/[id]/approve error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
