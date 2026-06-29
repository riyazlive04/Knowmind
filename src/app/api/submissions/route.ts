import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const submissionId = searchParams.get('id')

    const supabase = createClient()

    if (submissionId) {
      // Get single submission with member details
      const { data: submission, error: subError } = await supabase
        .from('submission')
        .select('*')
        .eq('id', submissionId)
        .single()

      if (subError) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
      }

      // Get member details
      const { data: member } = await supabase
        .from('member')
        .select('*')
        .eq('id', submission.member_id)
        .single()

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

    let query = supabase
      .from('submission')
      .select('id, member_id, round, overall, created_at', { count: 'exact' })

    // Apply filters
    if (round) {
      query = query.eq('round', round)
    }

    // Sort and paginate
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    query = query.range(page * pageSize, (page + 1) * pageSize - 1)

    const { data: submissions, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get member details for all submissions
    const memberIds = submissions?.map((s: any) => s.member_id) || []
    const { data: members } = await supabase
      .from('member')
      .select('id, name')
      .in('id', memberIds)

    const memberMap = new Map(members?.map((m: any) => [m.id, m.name]) || [])

    // Enrich submissions with member names and EI band
    const enrichedSubmissions = submissions?.map((sub: any) => {
      let band = 'Needs Support'
      if (sub.overall >= 4.0) band = 'High'
      else if (sub.overall >= 3.0) band = 'Moderate'

      return {
        ...sub,
        member_name: memberMap.get(sub.member_id) || 'Unknown',
        ei_band: band,
      }
    })

    // Client-side filter by member name if provided
    let filtered = enrichedSubmissions || []
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
