import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    const supabase = createClient()

    if (memberId) {
      // Get report for a specific member
      const { data: report, error } = await supabase
        .from('report')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 })
      }

      // Get member and submission data
      const { data: member } = await supabase
        .from('member')
        .select('*')
        .eq('id', memberId)
        .single()

      const { data: submission } = await supabase
        .from('submission')
        .select('*')
        .eq('id', report.submission_id)
        .single()

      return NextResponse.json({
        success: true,
        report,
        member,
        submission,
      })
    }

    // List all reports
    const { data: reports, error } = await supabase
      .from('report')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get member names for reports
    const memberIds = reports?.map((r: any) => r.member_id) || []
    const { data: members } = await supabase
      .from('member')
      .select('id, name')
      .in('id', memberIds)

    const memberMap = new Map(members?.map((m: any) => [m.id, m.name]) || [])

    const enrichedReports = reports?.map((report: any) => ({
      ...report,
      member_name: memberMap.get(report.member_id) || 'Unknown',
    }))

    return NextResponse.json({
      success: true,
      reports: enrichedReports || [],
      total: enrichedReports?.length || 0,
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
