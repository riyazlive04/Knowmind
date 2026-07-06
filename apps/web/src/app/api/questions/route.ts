import { prisma } from '@knowmind/db'
import { NextRequest, NextResponse } from 'next/server'

// Console API for managing "tests" (question_version rows) and their questions.
//
// A test == one question_version (status: draft | published, items: JSONB[]).
// All create/update operations run server-side via Prisma against Neon.
//
// Question item shape (matches what AssessmentForm / scoring expect):
//   { id, domain (1..6), domain_name, text, type: 'likert'|'free_text', reverse }
//
// Note: the canonical scorer expects 27 likert items in a 5/5/5/5/5/2
// distribution across the 6 domains. The builder does not enforce this — it
// surfaces counts so the editor can match it before publishing.

const DOMAINS = [
  { id: 1, name: 'Self-Awareness' },
  { id: 2, name: 'Self-Regulation' },
  { id: 3, name: 'Motivation' },
  { id: 4, name: 'Empathy' },
  { id: 5, name: 'Social & Leadership' },
  { id: 6, name: 'Relationship Intelligence' },
]

type QuestionItem = {
  id: number
  domain: number
  domain_name: string
  text: string
  type: 'likert' | 'free_text'
  reverse: boolean
  placeholder?: string
}

function asItems(value: unknown): QuestionItem[] {
  return Array.isArray(value) ? (value as QuestionItem[]) : []
}

// GET /api/questions            -> list all tests (with item counts)
// GET /api/questions?id=<uuid>  -> single test with full items
export async function GET(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id')

    if (id) {
      const data = await prisma.questionVersion.findUnique({ where: { id } })
      if (!data) return NextResponse.json({ error: 'Test not found' }, { status: 404 })
      return NextResponse.json({ test: data })
    }

    const data = await prisma.questionVersion.findMany({
      orderBy: { version_no: 'desc' },
    })

    const tests = data.map((t) => {
      const items = asItems(t.items)
      return {
        id: t.id,
        version_no: t.version_no,
        status: t.status,
        created_at: t.created_at,
        total: items.length,
        likert: items.filter((i) => i.type !== 'free_text').length,
        free_text: items.filter((i) => i.type === 'free_text').length,
      }
    })
    return NextResponse.json({ tests })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/questions  { action, ... }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    // --- Create a new draft test ---
    if (action === 'createTest') {
      const latest = await prisma.questionVersion.findFirst({
        orderBy: { version_no: 'desc' },
        select: { version_no: true },
      })
      const nextNo = (latest?.version_no ?? 0) + 1

      const data = await prisma.questionVersion.create({
        data: { version_no: nextNo, status: 'draft', items: [] },
      })
      return NextResponse.json({ test: data })
    }

    // --- Add a question to a test ---
    if (action === 'addQuestion') {
      const { id, question } = body
      if (!id) return NextResponse.json({ error: 'Test id required' }, { status: 400 })

      const text = (question?.text ?? '').toString().trim()
      const domain = Number(question?.domain)
      const type: 'likert' | 'free_text' =
        question?.type === 'free_text' ? 'free_text' : 'likert'
      const reverse = !!question?.reverse

      if (!text) return NextResponse.json({ error: 'Question text is required' }, { status: 400 })
      const domainDef = DOMAINS.find((d) => d.id === domain)
      if (type === 'likert' && !domainDef)
        return NextResponse.json({ error: 'A valid domain (1-6) is required for likert questions' }, { status: 400 })

      const current = await prisma.questionVersion.findUnique({
        where: { id },
        select: { items: true, status: true },
      })
      if (!current) return NextResponse.json({ error: 'Test not found' }, { status: 404 })
      if (current.status === 'published')
        return NextResponse.json({ error: 'Cannot edit a published test. Create a new version.' }, { status: 409 })

      const items = asItems(current.items)
      const nextId = items.reduce((m, i) => Math.max(m, i.id || 0), 0) + 1

      const newItem: QuestionItem =
        type === 'free_text'
          ? { id: nextId, domain: 0, domain_name: 'Reflection', text, type, reverse: false, placeholder: question?.placeholder || '' }
          : { id: nextId, domain, domain_name: domainDef!.name, text, type, reverse }

      const updated = [...items, newItem]
      const data = await prisma.questionVersion.update({
        where: { id },
        data: { items: updated as any },
      })
      return NextResponse.json({ test: data, added: newItem })
    }

    // --- Edit an existing question in a test ---
    if (action === 'updateQuestion') {
      const { id, questionId, question } = body
      if (!id) return NextResponse.json({ error: 'Test id required' }, { status: 400 })
      if (questionId == null)
        return NextResponse.json({ error: 'Question id required' }, { status: 400 })

      const text = (question?.text ?? '').toString().trim()
      const domain = Number(question?.domain)
      const type: 'likert' | 'free_text' =
        question?.type === 'free_text' ? 'free_text' : 'likert'
      const reverse = !!question?.reverse

      if (!text) return NextResponse.json({ error: 'Question text is required' }, { status: 400 })
      const domainDef = DOMAINS.find((d) => d.id === domain)
      if (type === 'likert' && !domainDef)
        return NextResponse.json({ error: 'A valid domain (1-6) is required for likert questions' }, { status: 400 })

      const current = await prisma.questionVersion.findUnique({
        where: { id },
        select: { items: true, status: true },
      })
      if (!current) return NextResponse.json({ error: 'Test not found' }, { status: 404 })
      if (current.status === 'published')
        return NextResponse.json({ error: 'Cannot edit a published test. Create a new version.' }, { status: 409 })

      const items = asItems(current.items)
      if (!items.some((i) => i.id === questionId))
        return NextResponse.json({ error: 'Question not found in this test' }, { status: 404 })

      const updatedItems = items.map((i) =>
        i.id === questionId
          ? type === 'free_text'
            ? { ...i, text, type, domain: 0, domain_name: 'Reflection', reverse: false, placeholder: question?.placeholder ?? i.placeholder ?? '' }
            : { ...i, text, type, domain, domain_name: domainDef!.name, reverse }
          : i
      )

      const data = await prisma.questionVersion.update({
        where: { id },
        data: { items: updatedItems as any },
      })
      return NextResponse.json({ test: data })
    }

    // --- Delete a question from a test ---
    if (action === 'deleteQuestion') {
      const { id, questionId } = body
      if (!id) return NextResponse.json({ error: 'Test id required' }, { status: 400 })

      const current = await prisma.questionVersion.findUnique({
        where: { id },
        select: { items: true, status: true },
      })
      if (!current) return NextResponse.json({ error: 'Test not found' }, { status: 404 })
      if (current.status === 'published')
        return NextResponse.json({ error: 'Cannot edit a published test.' }, { status: 409 })

      const items = asItems(current.items)
      const updated = items.filter((i) => i.id !== questionId)
      const data = await prisma.questionVersion.update({
        where: { id },
        data: { items: updated as any },
      })
      return NextResponse.json({ test: data })
    }

    // --- Delete an entire test (question_version) ---
    if (action === 'deleteTest') {
      const { id } = body
      if (!id) return NextResponse.json({ error: 'Test id required' }, { status: 400 })

      await prisma.questionVersion.delete({ where: { id } })
      return NextResponse.json({ ok: true, deletedId: id })
    }

    // --- Publish / unpublish a test ---
    if (action === 'updateStatus') {
      const { id, status } = body
      if (!id || !['draft', 'published'].includes(status))
        return NextResponse.json({ error: 'Valid id and status (draft|published) required' }, { status: 400 })

      const data = await prisma.questionVersion.update({
        where: { id },
        data: { status },
      })
      return NextResponse.json({ test: data })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    console.error('POST /api/questions error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
