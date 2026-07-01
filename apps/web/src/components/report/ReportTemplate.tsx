'use client'

interface ReportTemplateProps {
  member: {
    id: string
    name: string
    business?: string
    phone?: string
    location?: string
  }
  submission: {
    overall: number
    domain_scores: Record<string, number>
    personal_competence: number
    social_competence: number
    free_text?: Record<string, string>
  }
  report: {
    personal_note: string
    what_you_shared: string
    action_plan: string
  }
}

// Brand palette (solid, print/PDF-friendly — never black shadows, never red)
const BRAND = {
  purple900: '#2A1342',
  purple800: '#3B1C5A',
  purple700: '#4E2775',
  purple600: '#633394',
  purple500: '#7B45B0',
  purple50: '#F2ECF9',
  gold600: '#C9952F',
  gold500: '#E6B44C',
  gold400: '#FEB737',
  gold100: '#FFF2D6',
  cream: '#F6F1E8',
  success: '#3FA66A',
  successSoft: '#E4F2EA',
  ink900: '#231F1A',
  ink700: '#403A33',
  ink500: '#6E675D',
  ink400: '#9A9388',
  ink200: '#E4DDD1',
  ink100: '#F1ECE3',
}

export default function ReportTemplate({ member, submission, report }: ReportTemplateProps) {
  const domains = [
    { name: 'Self-Awareness', key: 'Self-Awareness' },
    { name: 'Self-Regulation', key: 'Self-Regulation' },
    { name: 'Motivation', key: 'Motivation' },
    { name: 'Empathy', key: 'Empathy' },
    { name: 'Social & Leadership', key: 'Social & Leadership' },
    { name: 'Relationship Intelligence', key: 'Relationship Intelligence' },
  ]

  // Band semantics: strong / emerging / developing — NEVER red for low scores.
  const getBand = (score: number) => {
    if (score >= 4.0) return 'High'
    if (score >= 3.0) return 'Moderate'
    return 'Needs Support'
  }

  // Brand-aligned band color (developing=gold, emerging=purple, strong=green). No red.
  const getBandColor = (score: number) => {
    if (score >= 4.0) return BRAND.success // strong
    if (score >= 3.0) return BRAND.purple500 // emerging
    return BRAND.gold600 // developing
  }

  // Tinted soft fill + text pairing for band pills (color + label, never color alone)
  const getBandPill = (score: number) => {
    if (score >= 4.0) return { bg: BRAND.successSoft, fg: BRAND.success } // strong
    if (score >= 3.0) return { bg: BRAND.purple50, fg: BRAND.purple600 } // emerging
    return { bg: BRAND.gold100, fg: BRAND.gold600 } // developing
  }

  const headingFont = '"Plus Jakarta Sans", system-ui, sans-serif'

  // Calculate primary strength and growth opportunity
  const scores = Object.entries(submission.domain_scores).map(([key, score]) => ({
    name: key,
    score: score as number,
  }))
  const primaryStrength = scores.reduce((a, b) => (a.score > b.score ? a : b))
  const growthOpportunity = scores.reduce((a, b) => (a.score < b.score ? a : b))

  const Band = ({ score }: { score: number }) => {
    const p = getBandPill(score)
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 10px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: 700,
          backgroundColor: p.bg,
          color: p.fg,
        }}
      >
        {getBand(score)}
      </span>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: BRAND.ink700, lineHeight: '1.6' }}>
      {/* Header */}
      <div
        style={{
          textAlign: 'center',
          padding: '40px 20px',
          borderBottom: `3px solid ${BRAND.purple800}`,
          marginBottom: '40px',
        }}
      >
        <h2 style={{ fontFamily: headingFont, color: BRAND.purple800, margin: '0 0 10px 0', letterSpacing: '-0.01em' }}>
          KnowMind Universe
        </h2>
        <p style={{ color: BRAND.ink500, margin: '5px 0', fontSize: '14px' }}>
          Training | Coaching | Therapy
        </p>
        <h1
          style={{
            fontFamily: headingFont,
            fontSize: '24px',
            color: BRAND.purple800,
            margin: '15px 0 10px 0',
            letterSpacing: '-0.01em',
          }}
        >
          EMOTIONAL INTELLIGENCE ASSESSMENT REPORT
        </h1>
        <p style={{ color: BRAND.gold600, fontWeight: 'bold', margin: '5px 0' }}>
          Entrepreneur Series
        </p>
      </div>

      {/* Personal Note */}
      {report.personal_note && (
        <div
          style={{
            marginBottom: '40px',
            padding: '24px',
            backgroundColor: BRAND.cream,
            borderRadius: '16px',
            borderLeft: `4px solid ${BRAND.gold400}`,
          }}
        >
          <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.8' }}>
            {report.personal_note}
          </div>
          <p style={{ marginTop: '20px', fontStyle: 'italic', color: BRAND.ink500 }}>
            Kaleeswaran<br />
            Founder, KnowMind Universe
          </p>
        </div>
      )}

      {/* Member Info & Overall Score */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontFamily: headingFont, color: BRAND.purple800, marginBottom: '10px' }}>
            {member.name}
          </h2>
          {member.business && <p style={{ color: BRAND.ink500, margin: '5px 0' }}>{member.business}</p>}
          {member.location && (
            <p style={{ color: BRAND.ink500, margin: '5px 0' }}>{member.location}</p>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px',
            background: 'linear-gradient(135deg, #4E2775 0%, #3B1C5A 60%, #2A1342 100%)',
            color: '#fff',
            borderRadius: '20px',
          }}
        >
          <div>
            <p style={{ color: BRAND.purple50, margin: '0 0 5px 0', opacity: 0.85 }}>Overall EI Score</p>
            <p
              style={{
                fontFamily: headingFont,
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#fff',
                margin: 0,
              }}
            >
              {submission.overall.toFixed(2)}
              <span style={{ fontSize: '24px', color: BRAND.purple50, opacity: 0.8 }}> / 5</span>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Band score={submission.overall} />
          </div>
        </div>
      </div>

      {/* Dimension Scores Table */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: headingFont, color: BRAND.purple800, marginBottom: '20px' }}>
          YOUR EI DIMENSION SCORES
        </h2>
        <p style={{ color: BRAND.ink500, fontSize: '13px', marginBottom: '15px' }}>
          High ≥ 4.0 | Moderate 3.0-3.9 | Needs Support &lt; 3.0
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: BRAND.purple50, borderBottom: `2px solid ${BRAND.purple800}` }}>
              <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold', color: BRAND.purple800 }}>Dimension</th>
              <th style={{ textAlign: 'center', padding: '12px', fontWeight: 'bold', color: BRAND.purple800 }}>Score</th>
              <th style={{ textAlign: 'center', padding: '12px', fontWeight: 'bold', color: BRAND.purple800 }}>Level</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((domain, idx) => {
              const score = submission.domain_scores[domain.name] || 0
              return (
                <tr key={idx} style={{ borderBottom: `1px solid ${BRAND.ink100}` }}>
                  <td style={{ padding: '12px', color: BRAND.ink700, fontWeight: 600 }}>{domain.name}</td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>
                    <div
                      style={{
                        width: '200px',
                        height: '20px',
                        backgroundColor: BRAND.ink100,
                        borderRadius: '9999px',
                        overflow: 'hidden',
                        margin: '0 auto',
                      }}
                    >
                      <div
                        style={{
                          width: `${(score / 5) * 100}%`,
                          height: '100%',
                          backgroundColor: getBandColor(score),
                          borderRadius: '9999px',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '12px', color: BRAND.ink500, display: 'block', marginTop: '4px' }}>
                      {score.toFixed(2)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>
                    <Band score={score} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Competence Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        <div style={{ padding: '24px', backgroundColor: BRAND.gold100, borderRadius: '16px' }}>
          <p style={{ color: BRAND.ink500, margin: '0 0 10px 0' }}>Personal Competence</p>
          <p
            style={{
              fontFamily: headingFont,
              fontSize: '32px',
              fontWeight: 'bold',
              color: BRAND.gold600,
              margin: 0,
            }}
          >
            {submission.personal_competence?.toFixed(2) || 'N/A'}
          </p>
          <p style={{ fontSize: '12px', color: BRAND.ink500, margin: '5px 0 0 0' }}>
            Self-Awareness + Self-Regulation + Motivation
          </p>
        </div>

        <div style={{ padding: '24px', backgroundColor: BRAND.purple50, borderRadius: '16px' }}>
          <p style={{ color: BRAND.ink500, margin: '0 0 10px 0' }}>Social Competence</p>
          <p
            style={{
              fontFamily: headingFont,
              fontSize: '32px',
              fontWeight: 'bold',
              color: BRAND.purple600,
              margin: 0,
            }}
          >
            {submission.social_competence?.toFixed(2) || 'N/A'}
          </p>
          <p style={{ fontSize: '12px', color: BRAND.ink500, margin: '5px 0 0 0' }}>
            Empathy + Social & Leadership + Relationship Intelligence
          </p>
        </div>
      </div>

      {/* Primary Strength */}
      <div style={{ marginBottom: '40px', padding: '24px', backgroundColor: BRAND.successSoft, borderRadius: '16px' }}>
        <h3 style={{ fontFamily: headingFont, color: BRAND.success, margin: '0 0 10px 0' }}>
          YOUR PRIMARY STRENGTH
        </h3>
        <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 5px 0', color: BRAND.ink900 }}>
          {primaryStrength.name}: {primaryStrength.score.toFixed(2)}
        </p>
        <p style={{ color: BRAND.ink500, margin: 0 }}>
          This is your strongest EI dimension. Leverage this strength in your leadership and relationships.
        </p>
      </div>

      {/* Growth Opportunity */}
      <div style={{ marginBottom: '40px', padding: '24px', backgroundColor: BRAND.gold100, borderRadius: '16px' }}>
        <h3 style={{ fontFamily: headingFont, color: BRAND.gold600, margin: '0 0 10px 0' }}>
          YOUR GROWTH OPPORTUNITY
        </h3>
        <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 5px 0', color: BRAND.ink900 }}>
          {growthOpportunity.name}: {growthOpportunity.score.toFixed(2)}
        </p>
        <p style={{ color: BRAND.ink500, margin: 0 }}>
          This dimension presents your greatest opportunity for growth and development.
        </p>
      </div>

      {/* What You Shared */}
      {report.what_you_shared && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: headingFont, color: BRAND.purple800, marginBottom: '15px' }}>
            WHAT YOU SHARED - HEARD & ACKNOWLEDGED
          </h2>
          <div
            style={{
              padding: '20px',
              backgroundColor: BRAND.cream,
              borderLeft: `4px solid ${BRAND.purple600}`,
              borderRadius: '12px',
              whiteSpace: 'pre-wrap',
            }}
          >
            {report.what_you_shared}
          </div>
        </div>
      )}

      {/* Action Plan */}
      {report.action_plan && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: headingFont, color: BRAND.purple800, marginBottom: '15px' }}>
            YOUR PERSONALISED ACTION PLAN
          </h2>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: BRAND.ink700 }}>
            {report.action_plan}
          </div>
        </div>
      )}

      {/* Next Step */}
      <div
        style={{
          marginBottom: '40px',
          padding: '32px',
          background: 'linear-gradient(135deg, #4E2775 0%, #3B1C5A 60%, #2A1342 100%)',
          color: 'white',
          borderRadius: '20px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontFamily: headingFont, margin: '0 0 15px 0', color: '#fff' }}>
          YOUR NEXT STEP
        </h2>
        <p style={{ margin: '0 0 15px 0', fontSize: '16px', color: BRAND.gold400, fontWeight: 700 }}>
          THE KNOWMIND EI RETREAT
        </p>
        <p style={{ margin: 0, fontSize: '14px', color: BRAND.purple50, opacity: 0.9 }}>
          Join us for a transformative retreat where we deepen your EI journey with peer learning, coaching,
          and practical tools to amplify your strengths and address growth opportunities.
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          paddingTop: '20px',
          borderTop: `2px solid ${BRAND.ink200}`,
          textAlign: 'center',
          fontSize: '12px',
          color: BRAND.ink400,
        }}
      >
        <p style={{ margin: '10px 0' }}>
          This report has been prepared exclusively for <strong>{member.name}</strong>.
        </p>
        <p style={{ margin: '10px 0' }}>
          © {new Date().getFullYear()} KnowMind Universe. All rights reserved. Confidential.
        </p>
      </div>
    </div>
  )
}
