import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

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

    let supabase
    try {
      supabase = createServiceClient()
    } catch {
      return NextResponse.json(
        { error: 'Report editing is not configured (missing service-role key).' },
        { status: 500 }
      )
    }

    // Reject edits to locked reports.
    const { data: current, error: loadErr } = await supabase
      .from('report')
      .select('state')
      .eq('id', reportId)
      .single()
    if (loadErr) return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    if (current.state === 'Approved' || current.state === 'Sent') {
      return NextResponse.json(
        { error: 'This report is locked and can no longer be edited.' },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('report')
      .update({
        personal_note: personalNote ?? '',
        what_you_shared: whatYouShared ?? '',
        action_plan: actionPlan ?? '',
        state: 'Edited',
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, report: data })
  } catch (err: any) {
    console.error('POST /api/reports/[id]/save error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
