'use client'

import Link from 'next/link'
import ReportTemplate from '@/components/report/ReportTemplate'
import { ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/components/ui'

// Sample (dummy) data — demonstrates the rendered report a member receives.
// This is NOT real data; it is a static preview of the report template.
const SAMPLE_MEMBER = {
  id: 'sample-0001',
  name: 'Aarav Mehta',
  business: 'Mehta Logistics Pvt. Ltd.',
  phone: '+91 98765 43210',
  location: 'Bengaluru, India',
}

const SAMPLE_SUBMISSION = {
  overall: 3.65,
  domain_scores: {
    'Self-Awareness': 4.2,
    'Self-Regulation': 3.4,
    Motivation: 4.6,
    Empathy: 3.8,
    'Social & Leadership': 3.1,
    'Relationship Intelligence': 2.8,
  },
  personal_competence: 4.07,
  social_competence: 3.23,
  free_text: {
    '28': 'I want to lead my team without losing my temper under pressure.',
    '29': 'Balancing rapid growth with the wellbeing of my people.',
  },
}

const SAMPLE_REPORT = {
  personal_note: `Dear Aarav,

Thank you for taking the time to reflect honestly through this assessment. What stands out is your remarkable drive — your Motivation score is among the highest we see in the Entrepreneur Series. The same energy that built your business can now be turned inward, toward steadier self-regulation and deeper connection with the people around you.

This report is a mirror, not a verdict. Read it with curiosity.`,
  what_you_shared: `You shared that your biggest aspiration is to lead your team without losing your temper under pressure, and that your current challenge is balancing rapid growth with the wellbeing of your people.

We hear you. Both point to the same growth edge — moving from reacting in the moment to responding with intention.`,
  action_plan: `1. Pause-and-name: When you feel tension rising, take one breath and silently name the emotion before responding. Practise for 14 days.

2. Weekly 1:1s: Hold a 20-minute, agenda-free check-in with two key team members. Listen more than you speak.

3. Reflection journal: Each evening, note one moment you regulated well and one you would handle differently.

4. Strength anchor: Channel your Motivation into a single relationship goal this quarter — mentoring one rising leader.`,
}

export default function SampleReportPage() {
  return (
    <div className="min-h-full">
      {/* Toolbar — hidden when printing */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary">
            Sample Report
          </h1>
          <p className="text-sm text-text-muted">
            Dummy data — a preview of what a member receives.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/console/reports">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              Back to Reports
            </Button>
          </Link>
          <Button variant="primary" onClick={() => window.print()}>
            <Download className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* The "paper" — white report canvas centered on the cream console */}
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-md md:p-12 print:max-w-none print:rounded-none print:p-0 print:shadow-none">
        <ReportTemplate
          member={SAMPLE_MEMBER}
          submission={SAMPLE_SUBMISSION}
          report={SAMPLE_REPORT}
        />
      </div>
    </div>
  )
}
