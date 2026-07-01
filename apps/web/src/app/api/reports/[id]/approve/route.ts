import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// POST /api/reports/[id]/approve
// Locks the report by moving it to the "Approved" state.
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id

    let supabase
    try {
      supabase = createServiceClient()
    } catch {
      return NextResponse.json(
        { error: 'Report approval is not configured (missing service-role key).' },
        { status: 500 }
      )
    }

    const { data, error } = await supabase
      .from('report')
      .update({ state: 'Approved', updated_at: new Date().toISOString() })
      .eq('id', reportId)
      .select('*')
      .single()

    if (error) {
      if ((error as any).code === 'PGRST116')
        return NextResponse.json({ error: 'Report not found' }, { status: 404 })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, report: data })
  } catch (err: any) {
    console.error('POST /api/reports/[id]/approve error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
