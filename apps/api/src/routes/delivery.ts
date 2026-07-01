import express from 'express'
import { deliverReport, listDeliveries, updateDeliveryStatusByMessageId } from '../lib/delivery'
import { enqueueBatch, getJob, listJobs } from '../lib/deliveryQueue'
import {
  sendWhatsAppText,
  getInstanceStatus,
  isEvolutionConfigured,
  mapAckStatus,
} from '../lib/evolution'
import { requireServiceToken } from '../middleware/auth'

const router = express.Router()

// ---- Public: provider webhook (Evolution calls this; no service token) ----

// POST /api/delivery/webhook - Receive Evolution message status updates
router.post('/webhook', async (req, res) => {
  // Always 200 so Evolution doesn't retry-storm, even on malformed payloads.
  try {
    const body = req.body || {}
    const event = String(body.event || '').toLowerCase()

    // messages.update / send.message carry ack transitions. Data may be an
    // object or an array of them depending on Evolution version/config.
    const entries = Array.isArray(body.data) ? body.data : [body.data].filter(Boolean)
    let updated = 0

    for (const entry of entries) {
      const messageId = entry?.keyId || entry?.key?.id || entry?.id
      const rawStatus = entry?.status ?? entry?.update?.status
      const mapped = mapAckStatus(rawStatus)
      if (messageId && mapped) {
        const ok = await updateDeliveryStatusByMessageId(messageId, mapped)
        if (ok) updated++
      }
    }

    console.log(`[webhook] event=${event} entries=${entries.length} updated=${updated}`)
    res.json({ received: true, updated })
  } catch (error: any) {
    console.error('Webhook error:', error)
    res.json({ received: true, error: error.message })
  }
})

// ---- Protected: everything below requires the service token ----
router.use(requireServiceToken)

// GET /api/delivery/status - Evolution instance connection health
router.get('/status', async (_req, res) => {
  try {
    res.json({
      configured: isEvolutionConfigured(),
      connectionStatus: (await getInstanceStatus())?.status ?? null,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/delivery - List delivery records
router.get('/', async (_req, res) => {
  try {
    res.json({ success: true, deliveries: await listDeliveries() })
  } catch (error: any) {
    console.error('List deliveries error:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/delivery/test - Send a raw test message (no report/DB record)
router.post('/test', async (req, res) => {
  try {
    const { number, message } = req.body
    if (!number) return res.status(400).json({ error: 'number is required' })

    const text = message || 'KnowMind test message — WhatsApp delivery is working ✅'
    const result = await sendWhatsAppText(number, text)
    res.json({ success: true, sent: result.sent, status: result.status, messageId: result.messageId })
  } catch (error: any) {
    console.error('Test message error:', error)
    res.status(502).json({ success: false, error: error.message })
  }
})

// POST /api/delivery/send - Deliver a single report over WhatsApp
router.post('/send', async (req, res) => {
  try {
    const { reportId } = req.body
    if (!reportId) return res.status(400).json({ error: 'reportId is required' })

    const delivery = await deliverReport(reportId)
    res.json({ success: delivery.status !== 'failed', delivery })
  } catch (error: any) {
    console.error('Send report error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/delivery/send-bulk - Stagger-send a batch with randomized intervals
router.post('/send-bulk', async (req, res) => {
  try {
    const { reportIds, minIntervalMs, maxIntervalMs } = req.body
    if (!Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({ error: 'reportIds (non-empty array) is required' })
    }

    const job = enqueueBatch(reportIds, {
      minMs: minIntervalMs !== undefined ? Number(minIntervalMs) : undefined,
      maxMs: maxIntervalMs !== undefined ? Number(maxIntervalMs) : undefined,
    })
    res.json({ success: true, jobId: job.id, job })
  } catch (error: any) {
    console.error('Bulk send error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/delivery/queue - List recent queue jobs
router.get('/queue', (_req, res) => {
  res.json({ success: true, jobs: listJobs() })
})

// GET /api/delivery/queue/:jobId - Live progress of a stagger job
router.get('/queue/:jobId', (req, res) => {
  const job = getJob(req.params.jobId)
  if (!job) return res.status(404).json({ error: 'Job not found' })
  res.json({ success: true, job })
})

export default router
