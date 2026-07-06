/**
 * Delivery orchestration (M5) — records WhatsApp sends in the `delivery` table
 * and advances report state. Uses the shared Prisma client (@knowmind/db).
 */
import { prisma } from '@knowmind/db'
import { sendWhatsAppText } from './evolution'

export interface DeliveryRecord {
  id: string
  report_id: string
  channel: string
  status: string
  evolution_message_id: string | null
  attempt: number
  error: string | null
  sent_at: string | null
}

// Prisma returns `sent_at` as a Date; the DeliveryRecord contract (and the JSON
// the API previously returned via Supabase) uses an ISO string.
function serializeDelivery(d: {
  id: string
  report_id: string
  channel: string
  status: string
  evolution_message_id: string | null
  attempt: number
  error: string | null
  sent_at: Date | null
}): DeliveryRecord {
  return { ...d, sent_at: d.sent_at ? d.sent_at.toISOString() : null }
}

/**
 * Deliver a generated report to its member over WhatsApp.
 *
 * Flow: load report + member → build the message → create a pending delivery
 * row → send via Evolution → update the row (sent/failed) and the report state.
 */
export async function deliverReport(reportId: string): Promise<DeliveryRecord> {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      member_id: true,
      state: true,
      what_you_shared: true,
      share_link_token: true,
      member: { select: { name: true, phone: true } },
    },
  })

  if (!report) {
    throw new Error(`Report not found: ${reportId}`)
  }

  const member = report.member
  const phone = member?.phone ?? undefined
  if (!phone) {
    throw new Error(`Member ${report.member_id} has no phone number on file`)
  }

  // Create the pending delivery row first so a crash mid-send is still recorded.
  const pending = await prisma.delivery.create({
    data: { report_id: reportId, channel: 'whatsapp', status: 'pending', attempt: 1 },
  })

  const message = buildReportMessage(member?.name, report.what_you_shared ?? undefined)

  try {
    const result = await sendWhatsAppText(phone, message)

    const updated = await prisma.delivery.update({
      where: { id: pending.id },
      data: {
        status: result.status,
        evolution_message_id: result.messageId,
        sent_at: new Date(),
        error: null,
      },
    })

    // Only flip the report to 'sent' on a real send (not a stub).
    if (result.sent) {
      await prisma.report.update({ where: { id: reportId }, data: { state: 'sent' } })
    }

    return serializeDelivery(updated)
  } catch (err: any) {
    const failed = await prisma.delivery.update({
      where: { id: pending.id },
      data: { status: 'failed', error: err.message },
    })

    await prisma.report.update({ where: { id: reportId }, data: { state: 'failed' } })
    return serializeDelivery(failed)
  }
}

/** List delivery records (most recent first). */
export async function listDeliveries(limit = 100): Promise<DeliveryRecord[]> {
  const rows = await prisma.delivery.findMany({
    orderBy: { sent_at: { sort: 'desc', nulls: 'last' } },
    take: limit,
  })
  return rows.map(serializeDelivery)
}

/**
 * Update a delivery row's status from a provider webhook, keyed on the Evolution
 * message id. Never downgrades (e.g. a late 'sent' ack won't overwrite 'read').
 * Returns true if a row was updated.
 */
const STATUS_RANK: Record<string, number> = {
  pending: 0,
  queued: 0,
  sent: 1,
  delivered: 2,
  read: 3,
  failed: 4,
}

export async function updateDeliveryStatusByMessageId(
  messageId: string,
  status: 'sent' | 'delivered' | 'read' | 'failed'
): Promise<boolean> {
  const existing = await prisma.delivery.findFirst({
    where: { evolution_message_id: messageId },
    select: { id: true, status: true },
  })

  if (!existing) return false

  // Don't move backwards (out-of-order webhooks), but 'failed' always wins.
  const current = STATUS_RANK[existing.status] ?? 0
  const next = STATUS_RANK[status] ?? 0
  if (status !== 'failed' && next <= current) return false

  try {
    await prisma.delivery.update({ where: { id: existing.id }, data: { status } })
    return true
  } catch {
    return false
  }
}

function buildReportMessage(name: string | undefined, whatYouShared: string | undefined): string {
  const greeting = name ? `Hi ${name},` : 'Hi,'
  const body =
    whatYouShared?.trim() ||
    'Your KnowMind emotional intelligence report is ready. Thank you for completing your assessment.'
  return `${greeting}\n\n${body}\n\n— KnowMind`
}
