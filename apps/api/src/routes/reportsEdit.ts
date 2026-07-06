import express from 'express'
import { prisma } from '@knowmind/db'

const router = express.Router()

// POST /api/reports/:id/save - Save narrative edits
router.post('/:id/save', async (req, res) => {
  try {
    const { id } = req.params
    const { personalNote, whatYouShared, actionPlan, changedFields } = req.body

    // Fetch current report
    const currentReport = await prisma.report.findUnique({ where: { id } })

    if (!currentReport) {
      return res.status(404).json({ error: 'Report not found' })
    }

    // Prepare update
    const updateData: any = { state: 'Edited' }
    if (changedFields?.personalNote) updateData.personal_note = personalNote
    if (changedFields?.whatYouShared) updateData.what_you_shared = whatYouShared
    if (changedFields?.actionPlan) updateData.action_plan = actionPlan

    // Update report
    try {
      await prisma.report.update({ where: { id }, data: updateData })
    } catch (updateError: any) {
      return res.status(500).json({ error: updateError.message })
    }

    // Record audit entry
    const oldValues: any = {}
    const newValues: any = {}

    if (changedFields?.personalNote) {
      oldValues.personal_note = currentReport.personal_note
      newValues.personal_note = personalNote
    }
    if (changedFields?.whatYouShared) {
      oldValues.what_you_shared = currentReport.what_you_shared
      newValues.what_you_shared = whatYouShared
    }
    if (changedFields?.actionPlan) {
      oldValues.action_plan = currentReport.action_plan
      newValues.action_plan = actionPlan
    }

    try {
      await prisma.audit.create({
        data: {
          report_id: id,
          member_id: currentReport.member_id,
          action: 'save',
          changed_fields: changedFields ?? undefined,
          old_values: oldValues,
          new_values: newValues,
          created_by: 'Kaleeswaran', // In production, get from auth session
        },
      })
    } catch (auditError) {
      console.warn('Audit logging failed:', auditError)
      // Don't fail the request if audit fails
    }

    res.json({
      success: true,
      report: updateData,
      message: 'Report saved',
    })
  } catch (error: any) {
    console.error('Save error:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/reports/:id/approve - Approve and lock report
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params

    // Fetch current report
    const currentReport = await prisma.report.findUnique({ where: { id } })

    if (!currentReport) {
      return res.status(404).json({ error: 'Report not found' })
    }

    // Check if already sent
    if (currentReport.state === 'Sent' || currentReport.state === 'Failed') {
      return res
        .status(400)
        .json({ error: `Cannot approve report in ${currentReport.state} state` })
    }

    // Update to Approved state
    try {
      await prisma.report.update({ where: { id }, data: { state: 'Approved' } })
    } catch (updateError: any) {
      return res.status(500).json({ error: updateError.message })
    }

    // Record audit entry
    try {
      await prisma.audit.create({
        data: {
          report_id: id,
          member_id: currentReport.member_id,
          action: 'approve',
          changed_fields: { state: true },
          old_values: { state: currentReport.state },
          new_values: { state: 'Approved' },
          created_by: 'Kaleeswaran',
        },
      })
    } catch (auditError) {
      console.warn('Audit logging failed:', auditError)
    }

    res.json({
      success: true,
      state: 'Approved',
      message: 'Report approved. Narrative is now locked.',
    })
  } catch (error: any) {
    console.error('Approve error:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/reports/:id/hold - Place report on hold
router.post('/:id/hold', async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    const currentReport = await prisma.report.findUnique({ where: { id } })

    if (!currentReport) {
      return res.status(404).json({ error: 'Report not found' })
    }

    try {
      await prisma.report.update({ where: { id }, data: { state: 'Hold' } })
    } catch (updateError: any) {
      return res.status(500).json({ error: updateError.message })
    }

    try {
      await prisma.audit.create({
        data: {
          report_id: id,
          member_id: currentReport.member_id,
          action: 'hold',
          notes: reason || null,
          created_by: 'Kaleeswaran',
        },
      })
    } catch (auditError) {
      console.warn('Audit logging failed:', auditError)
    }

    res.json({
      success: true,
      state: 'Hold',
      message: 'Report placed on hold',
    })
  } catch (error: any) {
    console.error('Hold error:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/reports/:id/audit - Get audit trail
router.get('/:id/audit', async (req, res) => {
  try {
    const { id } = req.params

    const auditEntries = await prisma.audit.findMany({
      where: { report_id: id },
      orderBy: { created_at: 'desc' },
    })

    res.json({
      success: true,
      audit: auditEntries,
    })
  } catch (error: any) {
    console.error('Audit fetch error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
