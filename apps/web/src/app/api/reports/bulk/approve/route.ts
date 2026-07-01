import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// POST /api/reports/bulk/approve  { reportIds: string[] }
// Marks the given reports as Approved (locks them from further editing).
// Uses the service-role client so it works regardless of RLS on the console.
export async function POST(request: NextRequest) {
  try {
    const { reportIds } = await request.json()

    if (!Array.isArray(reportIds) || reportIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No reports selected' },
        { status: 400 }
      )
    }

    let supabase
    try {
      supabase = createServiceClient()
    } catch {
      return NextResponse.json(
        { success: false, message: 'Report management is not configured (missing service-role key).' },
        { status: 500 }
      )
    }

    // Don't re-approve reports that are already locked/sent.
    const { data, error } = await supabase
      .from('report')
      .update({ state: 'Approved', updated_at: new Date().toISOString() })
      .in('id', reportIds)
      .not('state', 'in', '("Approved","Sent")')
      .select('id')

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    const approved = data?.length ?? 0
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
