import { prisma, Prisma } from '@knowmind/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/members-operations?id=<uuid> - Get single member with submissions
// GET /api/members-operations - List all members with filters
// POST /api/members-operations - Create or update member

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('id')

    if (memberId) {
      // Get single member with submissions
      const member = await prisma.member.findUnique({ where: { id: memberId } })

      if (!member) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 })
      }

      // Get member's submissions
      const submissions = await prisma.submission.findMany({
        where: { member_id: memberId },
        orderBy: { created_at: 'desc' },
      })

      return NextResponse.json({
        member,
        submissions,
      })
    }

    // List all members with filters
    const name = searchParams.get('name')
    const business = searchParams.get('business')
    const location = searchParams.get('location')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
    const page = parseInt(searchParams.get('page') || '0')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    const where: Prisma.MemberWhereInput = {}
    if (name) where.name = { contains: name, mode: 'insensitive' }
    if (business) where.business = business
    if (location) where.location = location

    const [members, count] = await Promise.all([
      prisma.member.findMany({
        where,
        orderBy: { [sortBy]: sortOrder } as any,
        skip: page * pageSize,
        take: pageSize,
      }),
      prisma.member.count({ where }),
    ])

    // Enrich members with submission data for EI band
    const submissions = await prisma.submission.findMany({
      where: { round: 'pre' },
      select: { member_id: true, overall: true },
    })

    const submissionMap = new Map<string, number>()
    submissions.forEach((sub) => {
      if (sub.member_id) submissionMap.set(sub.member_id, sub.overall)
    })

    const enrichedMembers = members.map((member) => {
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
      members: enrichedMembers,
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

    if (id) {
      // Update existing member
      try {
        const data = await prisma.member.update({
          where: { id },
          data: {
            name,
            phone: phone || null,
            location: location || null,
            business,
            gender,
            marital_status,
            notes,
          },
        })
        return NextResponse.json({ success: true, member: data })
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    } else {
      // Create new member
      try {
        const data = await prisma.member.create({
          data: {
            name,
            phone: phone || null,
            location: location || null,
            business,
            gender,
            marital_status,
            notes,
          },
        })
        return NextResponse.json({ success: true, member: data })
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }
  } catch (err: any) {
    console.error('POST /api/members-operations error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
