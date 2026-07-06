import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

// Server-to-server token for the Express backend (never exposed to the browser).
function backendHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (process.env.BACKEND_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.BACKEND_API_TOKEN}`
  }
  return headers
}

// Gate on the Auth.js session (same model as the rest of the console).
async function requireSession() {
  const session = await auth()
  return session?.user ?? null
}

// GET /api/delivery        - proxy the delivery list
// GET /api/delivery?resource=status - proxy Evolution instance health
export async function GET(request: NextRequest) {
  try {
    if (!(await requireSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resource = new URL(request.url).searchParams.get('resource')
    const path = resource === 'status' ? '/api/delivery/status' : '/api/delivery'

    const res = await fetch(`${BACKEND_URL}${path}`, { headers: backendHeaders() })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    console.error('GET /api/delivery error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/delivery - actions: send (single) | send-bulk (staggered batch)
export async function POST(request: NextRequest) {
  try {
    if (!(await requireSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...rest } = body

    const endpoint =
      action === 'send-bulk'
        ? '/api/delivery/send-bulk'
        : action === 'send'
          ? '/api/delivery/send'
          : null

    if (!endpoint) {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: backendHeaders(),
      body: JSON.stringify(rest),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    console.error('POST /api/delivery error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
