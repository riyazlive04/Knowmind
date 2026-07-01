/**
 * Staggered delivery queue (M5).
 *
 * Sends a batch of reports sequentially, sleeping a *randomized* interval
 * between each message so no two gaps are identical. WhatsApp providers flag
 * bursts of identically-timed messages as spam; varying the cadence keeps the
 * sending number healthy.
 *
 * The queue is in-memory (job progress is lost on restart), but every send is
 * persisted to the `delivery` table by deliverReport(), so delivery history
 * survives independently of the job tracker.
 */
import { deliverReport, DeliveryRecord } from './delivery'

const MIN_INTERVAL_MS = Number(process.env.DELIVERY_MIN_INTERVAL_MS) || 30_000 // 30s
const MAX_INTERVAL_MS = Number(process.env.DELIVERY_MAX_INTERVAL_MS) || 90_000 // 90s

export interface QueueItem {
  reportId: string
  status: 'pending' | 'sending' | 'sent' | 'failed'
  /** ms we waited before *this* send (0 for the first) */
  delayMs: number
  evolutionMessageId?: string | null
  error?: string | null
}

export interface QueueJob {
  id: string
  status: 'running' | 'completed'
  total: number
  sent: number
  failed: number
  createdAt: string
  items: QueueItem[]
  /** ms until the next send fires, for live UI countdown */
  nextSendInMs: number | null
}

const jobs = new Map<string, QueueJob>()

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Random integer in [min, max] — each gap is independently varied. */
function randomInterval(min: number, max: number): number {
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  return Math.floor(lo + Math.random() * (hi - lo))
}

export function getJob(id: string): QueueJob | undefined {
  return jobs.get(id)
}

export function listJobs(): QueueJob[] {
  return Array.from(jobs.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/**
 * Enqueue a batch and start processing in the background. Returns the job
 * immediately (status: 'running'); poll getJob(id) for progress.
 *
 * @param intervalRange optional per-request override of the global min/max.
 */
export function enqueueBatch(
  reportIds: string[],
  intervalRange?: { minMs?: number; maxMs?: number }
): QueueJob {
  const minMs = intervalRange?.minMs ?? MIN_INTERVAL_MS
  const maxMs = intervalRange?.maxMs ?? MAX_INTERVAL_MS

  // Job id without Date.now(): timestamp + short random suffix.
  const createdAt = new Date().toISOString()
  const id = `job_${createdAt.replace(/[^0-9]/g, '')}_${Math.random().toString(36).slice(2, 8)}`

  const job: QueueJob = {
    id,
    status: 'running',
    total: reportIds.length,
    sent: 0,
    failed: 0,
    createdAt,
    nextSendInMs: null,
    items: reportIds.map((reportId) => ({ reportId, status: 'pending', delayMs: 0 })),
  }
  jobs.set(id, job)

  // Fire-and-forget; the route returns the job snapshot right away.
  void processJob(job, minMs, maxMs)

  return job
}

async function processJob(job: QueueJob, minMs: number, maxMs: number): Promise<void> {
  for (let i = 0; i < job.items.length; i++) {
    const item = job.items[i]

    // Stagger: no wait before the first message, randomized gap before the rest.
    if (i > 0) {
      const delay = randomInterval(minMs, maxMs)
      item.delayMs = delay
      job.nextSendInMs = delay
      await sleep(delay)
    }
    job.nextSendInMs = null
    item.status = 'sending'

    try {
      const record: DeliveryRecord = await deliverReport(item.reportId)
      if (record.status === 'failed') {
        item.status = 'failed'
        item.error = record.error
        job.failed++
      } else {
        item.status = 'sent'
        item.evolutionMessageId = record.evolution_message_id
        job.sent++
      }
    } catch (err: any) {
      item.status = 'failed'
      item.error = err.message
      job.failed++
    }
  }

  job.status = 'completed'
  job.nextSendInMs = null
}
