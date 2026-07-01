/**
 * Delivery orchestration (M5) — records WhatsApp sends in the `delivery` table
 * and advances report state. Uses the service-role Supabase client (the
 * `delivery` table is service-role only under RLS).
 */
import { supabase } from './supabase'
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

/**
 * Deliver a generated report to its member over WhatsApp.
 *
 * Flow: load report + member → build the message → create a pending delivery
 * row → send via Evolution → update the row (sent/failed) and the report state.
 */
export async function deliverReport(reportId: string): Promise<DeliveryRecord> {
  const { data: report, error: reportErr } = await supabase
    .from('report')
    .select('id, member_id, state, what_you_shared, share_link_token, member:member_id (name, phone)')
    .eq('id', reportId)
    .single()

  if (reportErr || !report) {
    throw new Error(`Report not found: ${reportId}`)
  }

  const member = (report as any).member
  const phone: string | undefined = member?.phone
  if (!phone) {
    throw new Error(`Member ${report.member_id} has no phone number on file`)
  }

  // Create the pending delivery row first so a crash mid-send is still recorded.
  const { data: pending, error: insertErr } = await supabase
    .from('delivery')
    .insert({ report_id: reportId, channel: 'whatsapp', status: 'pending', attempt: 1 })
    .select()
    .single()

  if (insertErr || !pending) {
    throw new Error(`Failed to create delivery record: ${insertErr?.message}`)
  }

  const message = buildReportMessage(member?.name, (report as any).what_you_shared)

  try {
    const result = await sendWhatsAppText(phone, message)

    const { data: updated } = await supabase
      .from('delivery')
      .update({
        status: result.status,
        evolution_message_id: result.messageId,
        sent_at: new Date().toISOString(),
        error: null,
      })
      .eq('id', pending.id)
      .select()
      .single()

    // Only flip the report to 'sent' on a real send (not a stub).
    if (result.sent) {
      await supabase.from('report').update({ state: 'sent' }).eq('id', reportId)
    }

    return updated as DeliveryRecord
  } catch (err: any) {
    const { data: failed } = await supabase
      .from('delivery')
      .update({ status: 'failed', error: err.message })
      .eq('id', pending.id)
      .select()
      .single()

    await supabase.from('report').update({ state: 'failed' }).eq('id', reportId)
    return failed as DeliveryRecord
  }
}

/** List delivery records (most recent first). */
export async function listDeliveries(limit = 100): Promise<DeliveryRecord[]> {
  const { data, error } = await supabase
    .from('delivery')
    .select('*')
    .order('sent_at', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []) as DeliveryRecord[]
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
  const { data: existing } = await supabase
    .from('delivery')
    .select('id, status')
    .eq('evolution_message_id', messageId)
    .single()

  if (!existing) return false

  // Don't move backwards (out-of-order webhooks), but 'failed' always wins.
  const current = STATUS_RANK[existing.status] ?? 0
  const next = STATUS_RANK[status] ?? 0
  if (status !== 'failed' && next <= current) return false

  const { error } = await supabase.from('delivery').update({ status }).eq('id', existing.id)
  return !error
}

function buildReportMessage(name: string | undefined, whatYouShared: string | undefined): string {
  const greeting = name ? `Hi ${name},` : 'Hi,'
  const body =
    whatYouShared?.trim() ||
    'Your KnowMind emotional intelligence report is ready. Thank you for completing your assessment.'
  return `${greeting}\n\n${body}\n\n— KnowMind`
}
