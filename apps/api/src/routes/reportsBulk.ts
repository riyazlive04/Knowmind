import express from 'express'
import { prisma } from '@knowmind/db'

const router = express.Router()

// POST /api/reports/bulk/approve - Bulk approve reports
router.post('/bulk/approve', async (req, res) => {
  try {
    const { reportIds } = req.body

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({ error: 'reportIds array required' })
    }

    // Fetch reports to check states
    const reports = await prisma.report.findMany({ where: { id: { in: reportIds } } })

    const results = {
      approved: [] as string[],
      skipped: [] as { reportId: string; reason: string }[],
    }

    // Separate approvable and non-approvable reports
    for (const report of reports) {
      // Can only approve Draft or Edited, not if already Sent/Failed/Hold
      if (report.state === 'Sent' || report.state === 'Failed' || report.state === 'Hold') {
        results.skipped.push({
          reportId: report.id,
          reason: `Cannot approve: already in ${report.state} state`,
        })
      } else if (report.state === 'Approved') {
        results.skipped.push({
          reportId: report.id,
          reason: 'Already approved',
        })
      } else {
        // Draft or Edited - can approve
        results.approved.push(report.id)
      }
    }

    // Bulk update approved reports
    if (results.approved.length > 0) {
      try {
        await prisma.report.updateMany({
          where: { id: { in: results.approved } },
          data: { state: 'Approved' },
        })
      } catch (updateError: any) {
        return res.status(500).json({ error: updateError.message })
      }

      // Create audit entries for each approved report
      const approvedReports = reports.filter((r) => results.approved.includes(r.id))
      const auditEntries = approvedReports.map((report) => ({
        report_id: report.id,
        member_id: report.member_id,
        action: 'approve',
        changed_fields: { state: true },
        old_values: { state: report.state },
        new_values: { state: 'Approved' },
        created_by: 'Kaleeswaran (Bulk)',
      }))

      try {
        await prisma.audit.createMany({ data: auditEntries })
      } catch (auditError) {
        console.warn('Audit logging failed:', auditError)
      }
    }

    res.json({
      success: true,
      approved: results.approved.length,
      skipped: results.skipped.length,
      details: results,
      message: `Approved ${results.approved.length} reports${results.skipped.length > 0 ? `, skipped ${results.skipped.length}` : ''}`,
    })
  } catch (error: any) {
    console.error('Bulk approve error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
