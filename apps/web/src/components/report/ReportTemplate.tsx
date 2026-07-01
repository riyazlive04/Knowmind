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

export default function ReportTemplate({ member, submission, report }: ReportTemplateProps) {
  const domains = [
    { name: 'Self-Awareness', key: 'Self-Awareness' },
    { name: 'Self-Regulation', key: 'Self-Regulation' },
    { name: 'Motivation', key: 'Motivation' },
    { name: 'Empathy', key: 'Empathy' },
    { name: 'Social & Leadership', key: 'Social & Leadership' },
    { name: 'Relationship Intelligence', key: 'Relationship Intelligence' },
  ]

  const getBand = (score: number) => {
    if (score >= 4.0) return 'High'
    if (score >= 3.0) return 'Moderate'
    return 'Needs Support'
  }

  const getBandColor = (score: number) => {
    if (score >= 4.0) return '#10b981'
    if (score >= 3.0) return '#f59e0b'
    return '#ef4444'
  }

  // Calculate primary strength and growth opportunity
  const scores = Object.entries(submission.domain_scores).map(([key, score]) => ({
    name: key,
    score: score as number,
  }))
  const primaryStrength = scores.reduce((a, b) => (a.score > b.score ? a : b))
  const growthOpportunity = scores.reduce((a, b) => (a.score < b.score ? a : b))

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#333', lineHeight: '1.6' }}>
      {/* Header */}
      <div
        style={{
          textAlign: 'center',
          padding: '40px 20px',
          borderBottom: '3px solid #3B1C5A',
          marginBottom: '40px',
        }}
      >
        <h2 style={{ fontFamily: 'Fraunces, serif', color: '#3B1C5A', margin: '0 0 10px 0' }}>
          KnowMind Universe
        </h2>
        <p style={{ color: '#666', margin: '5px 0', fontSize: '14px' }}>
          Training | Coaching | Therapy
        </p>
        <h1
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '24px',
            color: '#3B1C5A',
            margin: '15px 0 10px 0',
          }}
        >
          EMOTIONAL INTELLIGENCE ASSESSMENT REPORT
        </h1>
        <p style={{ color: '#E6B44C', fontWeight: 'bold', margin: '5px 0' }}>
          Entrepreneur Series
        </p>
      </div>

      {/* Personal Note */}
      {report.personal_note && (
        <div style={{ marginBottom: '40px', padding: '20px', backgroundColor: '#f9f5f0' }}>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.8' }}>
            {report.personal_note}
          </div>
          <p style={{ marginTop: '20px', fontStyle: 'italic', color: '#666' }}>
            Kaleeswaran<br />
            Founder, KnowMind Universe
          </p>
        </div>
      )}

      {/* Member Info & Overall Score */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', color: '#3B1C5A', marginBottom: '10px' }}>
            {member.name}
          </h2>
          {member.business && <p style={{ color: '#666', margin: '5px 0' }}>{member.business}</p>}
          {member.location && (
            <p style={{ color: '#666', margin: '5px 0' }}>{member.location}</p>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px',
            backgroundColor: '#f0e6ff',
            borderRadius: '8px',
          }}
        >
          <div>
            <p style={{ color: '#666', margin: '0 0 5px 0' }}>Overall EI Score</p>
            <p
              style={{
                fontFamily: 'Fraunces, serif',
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#3B1C5A',
                margin: 0,
              }}
            >
              {submission.overall.toFixed(2)}
              <span style={{ fontSize: '24px', color: '#666' }}> / 5</span>
            </p>
          </div>
          <div
            style={{
              textAlign: 'right',
              fontSize: '18px',
              fontWeight: 'bold',
              color: getBandColor(submission.overall),
            }}
          >
            {getBand(submission.overall)}
          </div>
        </div>
      </div>

      {/* Dimension Scores Table */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', color: '#3B1C5A', marginBottom: '20px' }}>
          YOUR EI DIMENSION SCORES
        </h2>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '15px' }}>
          High ≥ 4.0 | Moderate 3.0-3.9 | Needs Support &lt; 3.0
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0e6ff', borderBottom: '2px solid #3B1C5A' }}>
              <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Dimension</th>
              <th style={{ textAlign: 'center', padding: '12px', fontWeight: 'bold' }}>Score</th>
              <th style={{ textAlign: 'center', padding: '12px', fontWeight: 'bold' }}>Level</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((domain, idx) => {
              const score = submission.domain_scores[domain.name] || 0
              return (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{domain.name}</td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>
                    <div
                      style={{
                        width: '200px',
                        height: '20px',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        margin: '0 auto',
                      }}
                    >
                      <div
                        style={{
                          width: `${(score / 5) * 100}%`,
                          height: '100%',
                          backgroundColor: getBandColor(score),
                        }}
                      />
                    </div>
                  </td>
                  <td
                    style={{
                      textAlign: 'center',
                      padding: '12px',
                      fontWeight: 'bold',
                      color: getBandColor(score),
                    }}
                  >
                    {score.toFixed(2)} - {getBand(score)}
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
        <div style={{ padding: '20px', backgroundColor: '#fff8e1', borderRadius: '8px' }}>
          <p style={{ color: '#666', margin: '0 0 10px 0' }}>Personal Competence</p>
          <p
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#E6B44C',
              margin: 0,
            }}
          >
            {submission.personal_competence?.toFixed(2) || 'N/A'}
          </p>
          <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
            Self-Awareness + Self-Regulation + Motivation
          </p>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#f3e5ff', borderRadius: '8px' }}>
          <p style={{ color: '#666', margin: '0 0 10px 0' }}>Social Competence</p>
          <p
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#8b5cf6',
              margin: 0,
            }}
          >
            {submission.social_competence?.toFixed(2) || 'N/A'}
          </p>
          <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
            Empathy + Social & Leadership + Relationship Intelligence
          </p>
        </div>
      </div>

      {/* Primary Strength */}
      <div style={{ marginBottom: '40px', padding: '20px', backgroundColor: '#e6f7ed', borderRadius: '8px' }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', color: '#10b981', margin: '0 0 10px 0' }}>
          YOUR PRIMARY STRENGTH
        </h3>
        <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
          {primaryStrength.name}: {primaryStrength.score.toFixed(2)}
        </p>
        <p style={{ color: '#666', margin: 0 }}>
          This is your strongest EI dimension. Leverage this strength in your leadership and relationships.
        </p>
      </div>

      {/* Growth Opportunity */}
      <div style={{ marginBottom: '40px', padding: '20px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', color: '#d97706', margin: '0 0 10px 0' }}>
          YOUR GROWTH OPPORTUNITY
        </h3>
        <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
          {growthOpportunity.name}: {growthOpportunity.score.toFixed(2)}
        </p>
        <p style={{ color: '#666', margin: 0 }}>
          This dimension presents your greatest opportunity for growth and development.
        </p>
      </div>

      {/* What You Shared */}
      {report.what_you_shared && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', color: '#3B1C5A', marginBottom: '15px' }}>
            WHAT YOU SHARED - HEARD & ACKNOWLEDGED
          </h2>
          <div
            style={{
              padding: '20px',
              backgroundColor: '#f5f5f5',
              borderLeft: '4px solid #3B1C5A',
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
          <h2 style={{ fontFamily: 'Fraunces, serif', color: '#3B1C5A', marginBottom: '15px' }}>
            YOUR PERSONALISED ACTION PLAN
          </h2>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
            {report.action_plan}
          </div>
        </div>
      )}

      {/* Next Step */}
      <div
        style={{
          marginBottom: '40px',
          padding: '30px',
          backgroundColor: '#3B1C5A',
          color: 'white',
          borderRadius: '8px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontFamily: 'Fraunces, serif', margin: '0 0 15px 0' }}>
          YOUR NEXT STEP
        </h2>
        <p style={{ margin: '0 0 15px 0', fontSize: '16px' }}>
          THE KNOWMIND EI RETREAT
        </p>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
          Join us for a transformative retreat where we deepen your EI journey with peer learning, coaching,
          and practical tools to amplify your strengths and address growth opportunities.
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          paddingTop: '20px',
          borderTop: '2px solid #ddd',
          textAlign: 'center',
          fontSize: '12px',
          color: '#999',
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
