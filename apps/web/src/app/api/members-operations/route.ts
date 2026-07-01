import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/members-operations?id=<uuid> - Get single member with submissions
// GET /api/members-operations - List all members with filters
// POST /api/members-operations - Create or update member
// DELETE /api/members-operations?id=<uuid> - Delete member

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('id')

    const supabase = createClient()

    if (memberId) {
      // Get single member with submissions
      const { data: member, error: memberError } = await supabase
        .from('member')
        .select('*')
        .eq('id', memberId)
        .single()

      if (memberError) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 })
      }

      // Get member's submissions
      const { data: submissions, error: subError } = await supabase
        .from('submission')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })

      if (subError) {
        console.error('Submission error:', subError)
      }

      return NextResponse.json({
        member,
        submissions: submissions || [],
      })
    }

    // List all members with filters
    const name = searchParams.get('name')
    const business = searchParams.get('business')
    const location = searchParams.get('location')
    const band = searchParams.get('band')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
    const page = parseInt(searchParams.get('page') || '0')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    let query = supabase.from('member').select('*', { count: 'exact' })

    // Apply filters
    if (name) {
      query = query.ilike('name', `%${name}%`)
    }
    if (business) {
      query = query.eq('business', business)
    }
    if (location) {
      query = query.eq('location', location)
    }

    // Sort and paginate
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    query = query.range(page * pageSize, (page + 1) * pageSize - 1)

    const { data: members, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Enrich members with submission data for EI band
    const { data: submissions } = await supabase
      .from('submission')
      .select('member_id, overall')
      .eq('round', 'pre')

    const submissionMap = new Map<string, number>()
    submissions?.forEach((sub: any) => {
      submissionMap.set(sub.member_id, sub.overall)
    })

    const enrichedMembers = members?.map((member: any) => {
      const overall = submissionMap.get(member.id)
      let band = 'No Score'
      if (overall !== undefined) {
        if (overall >= 4.0) band = 'High'
        else if (overall >= 3.0) band = 'Moderate'
        else band = 'Needs Support'
      }

      return {
        ...member,
        ei_band: band,
        overall_score: overall || null,
      }
    })

    return NextResponse.json({
      members: enrichedMembers || [],
      total: count || 0,
      page,
      pageSize,
    })
  } catch (err: any) {
    console.error('GET /api/members-operations error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, phone, location, business, gender, marital_status, notes } = body

    const supabase = createClient()

    if (id) {
      // Update existing member
      const { data, error } = await supabase
        .from('member')
        .update({
          name,
          phone: phone || null,
          location: location || null,
          business,
          gender,
          marital_status,
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, member: data })
    } else {
      // Create new member
      const { data, error } = await supabase
        .from('member')
        .insert([
          {
            name,
            phone: phone || null,
            location: location || null,
            business,
            gender,
            marital_status,
            notes,
          },
        ])
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, member: data })
    }
  } catch (err: any) {
    console.error('POST /api/members-operations error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
