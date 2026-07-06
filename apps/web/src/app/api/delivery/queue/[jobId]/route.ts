import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

function backendHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (process.env.BACKEND_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.BACKEND_API_TOKEN}`
  }
  return headers
}

// GET /api/delivery/queue/:jobId - poll live stagger-job progress
export async function GET(_request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const res = await fetch(`${BACKEND_URL}/api/delivery/queue/${params.jobId}`, {
      headers: backendHeaders(),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    console.error('GET /api/delivery/queue/[jobId] error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
