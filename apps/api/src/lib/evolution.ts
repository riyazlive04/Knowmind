/**
 * Evolution API client (WhatsApp delivery) — M5
 *
 * Wraps the Evolution API v2 (https://www.evolution-api.com/). Sending is gated
 * on EVOLUTION_API_URL + EVOLUTION_API_KEY being configured; when they are
 * missing, calls are stubbed (status: 'queued', no network) so development and
 * tests run without a live WhatsApp instance.
 */

const RAW_URL = process.env.EVOLUTION_API_URL || ''
const API_KEY = process.env.EVOLUTION_API_KEY || ''
const INSTANCE = process.env.EVOLUTION_INSTANCE_NAME || ''

/**
 * Normalize the configured URL into a clean API base. The .env historically
 * pointed at the manager UI (".../manager/"); strip that and any trailing slash
 * so we always hit the API root.
 */
function apiBase(): string {
  return RAW_URL.replace(/\/+$/, '').replace(/\/manager$/i, '')
}

export function isEvolutionConfigured(): boolean {
  return Boolean(RAW_URL && API_KEY && INSTANCE)
}

export interface SendResult {
  /** true when a real send was attempted (vs. stubbed) */
  sent: boolean
  /** Evolution's message id (key.id), if returned */
  messageId: string | null
  /** parsed status: 'sent' on success, 'queued' when stubbed */
  status: 'sent' | 'queued'
  /** raw Evolution response body for auditing/debugging */
  raw: unknown
}

/** Strip everything but digits — Evolution expects MSISDN with country code, no '+'. */
function normalizeNumber(number: string): string {
  return String(number).replace(/\D/g, '')
}

/**
 * Send a plain-text WhatsApp message via the configured Evolution instance.
 * Throws on a non-2xx response so callers can record the failure.
 */
export async function sendWhatsAppText(number: string, text: string): Promise<SendResult> {
  const to = normalizeNumber(number)
  if (!to) throw new Error('Invalid recipient number')

  if (!isEvolutionConfigured()) {
    console.warn('[evolution] not configured — stubbing send (status: queued)')
    return { sent: false, messageId: null, status: 'queued', raw: { stubbed: true } }
  }

  const url = `${apiBase()}/message/sendText/${encodeURIComponent(INSTANCE)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: API_KEY,
    },
    body: JSON.stringify({ number: to, text }),
  })

  const raw = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message =
      (raw as any)?.response?.message ||
      (raw as any)?.message ||
      `Evolution send failed (HTTP ${res.status})`
    throw new Error(Array.isArray(message) ? message.join('; ') : String(message))
  }

  const messageId = (raw as any)?.key?.id ?? null
  return { sent: true, messageId, status: 'sent', raw }
}

/**
 * Map a WhatsApp/Evolution message-ack status onto our delivery status enum.
 * Returns null for acks that don't advance our state (e.g. PENDING).
 *
 * Ack ladder: SERVER_ACK (sent) → DELIVERY_ACK (delivered) → READ/PLAYED (read).
 */
export function mapAckStatus(raw: string | number | undefined): 'sent' | 'delivered' | 'read' | 'failed' | null {
  if (raw === undefined || raw === null) return null
  const s = String(raw).toUpperCase()
  switch (s) {
    case 'SERVER_ACK':
    case 'SENT':
    case '1':
      return 'sent'
    case 'DELIVERY_ACK':
    case 'DELIVERED':
    case '2':
      return 'delivered'
    case 'READ':
    case 'PLAYED':
    case '3':
    case '4':
      return 'read'
    case 'ERROR':
    case 'FAILED':
      return 'failed'
    default:
      return null
  }
}

/**
 * Register a webhook URL on the configured instance so Evolution posts message
 * status updates to us. Run once (or whenever the public URL changes).
 */
export async function setInstanceWebhook(webhookUrl: string): Promise<boolean> {
  if (!isEvolutionConfigured()) return false

  const res = await fetch(`${apiBase()}/webhook/set/${encodeURIComponent(INSTANCE)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: API_KEY },
    body: JSON.stringify({
      webhook: {
        enabled: true,
        url: webhookUrl,
        webhookByEvents: false,
        events: ['MESSAGES_UPDATE', 'SEND_MESSAGE'],
      },
    }),
  })
  return res.ok
}

/**
 * Fetch the connection status of the configured instance. Returns the raw
 * Evolution instance record, or null when not configured / not found.
 */
export async function getInstanceStatus(): Promise<{ status: string; raw: unknown } | null> {
  if (!RAW_URL || !API_KEY) return null

  const res = await fetch(`${apiBase()}/instance/fetchInstances`, {
    headers: { apikey: API_KEY },
  })
  if (!res.ok) return null

  const list = (await res.json().catch(() => [])) as any[]
  const inst = Array.isArray(list) ? list.find((i) => i?.name === INSTANCE) : null
  if (!inst) return null

  return { status: inst.connectionStatus ?? 'unknown', raw: inst }
}
