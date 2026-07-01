'use client'

import DomainRadar from './DomainRadar'
import DomainBars from './DomainBars'

interface Scores {
  overall: number
  domainScores: Record<string, number>
  personalCompetence: number
  socialCompetence: number
  band: string
}

interface ResultsDisplayProps {
  results: Scores
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const domains = [
    { id: 1, name: 'Self-Awareness' },
    { id: 2, name: 'Self-Regulation' },
    { id: 3, name: 'Motivation' },
    { id: 4, name: 'Empathy' },
    { id: 5, name: 'Social & Leadership' },
    { id: 6, name: 'Relationship Intelligence' },
  ]

  const sortedDomains = domains.sort((a, b) => {
    const scoreA = results.domainScores[a.id] || 0
    const scoreB = results.domainScores[b.id] || 0
    return scoreB - scoreA
  })

  const strength = sortedDomains[0]
  const growth = sortedDomains[sortedDomains.length - 1]

  const getBandColor = (score: number) => {
    if (score >= 4.0) return 'text-success'
    if (score >= 3.0) return 'text-amber-600'
    return 'text-error'
  }

  const getBandLabel = (score: number) => {
    if (score >= 4.0) return 'High'
    if (score >= 3.0) return 'Moderate'
    return 'Needs Support'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-3 font-fraunces">
            Your Emotional Intelligence Profile
          </h1>
          <p className="text-lg text-text-muted">
            Based on your assessment responses
          </p>
        </div>

        {/* Overall Score Card */}
        <div className="bg-surface rounded-lg shadow-lg p-8 border border-border mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Overall Score */}
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2 font-fraunces">
                {results.overall.toFixed(2)}
              </div>
              <p className="text-text-muted mb-2">Overall Score</p>
              <p className={`text-lg font-semibold ${getBandColor(results.overall)}`}>
                {getBandLabel(results.overall)}
              </p>
            </div>

            {/* Personal Competence */}
            <div className="text-center">
              <div className="text-5xl font-bold text-amber-600 mb-2 font-fraunces">
                {results.personalCompetence.toFixed(2)}
              </div>
              <p className="text-text-muted">Personal Competence</p>
              <p className="text-sm text-text-muted mt-2">
                Self-Awareness + Self-Regulation + Motivation
              </p>
            </div>

            {/* Social Competence */}
            <div className="text-center">
              <div className="text-5xl font-bold text-violet-600 mb-2 font-fraunces">
                {results.socialCompetence.toFixed(2)}
              </div>
              <p className="text-text-muted">Social Competence</p>
              <p className="text-sm text-text-muted mt-2">
                Empathy + Social & Leadership + Relationships
              </p>
            </div>
          </div>
        </div>

        {/* Hexagon Radar */}
        <div className="bg-surface rounded-lg shadow-lg p-8 border border-border mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6 font-fraunces">
            Domain Radar
          </h2>
          <div className="flex justify-center">
            <DomainRadar scores={results.domainScores} domains={domains} />
          </div>
        </div>

        {/* Domain Bars */}
        <div className="bg-surface rounded-lg shadow-lg p-8 border border-border mb-12">
          <h2 className="text-2xl font-bold text-primary mb-6 font-fraunces">
            Domain Breakdown
          </h2>
          <DomainBars scores={results.domainScores} domains={domains} />
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Strength */}
          <div className="bg-success/10 rounded-lg p-6 border border-success/30">
            <h3 className="text-xl font-bold text-success mb-3 font-fraunces">
              Primary Strength
            </h3>
            <p className="text-lg font-semibold text-text mb-2">{strength.name}</p>
            <p className="text-2xl font-bold text-success">
              {results.domainScores[strength.id].toFixed(2)}
            </p>
            <p className="text-sm text-text-muted mt-3">
              This is your strongest emotional intelligence domain. Leverage this strength in
              your leadership and personal relationships.
            </p>
          </div>

          {/* Growth Edge */}
          <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
            <h3 className="text-xl font-bold text-amber-700 mb-3 font-fraunces">
              Growth Edge
            </h3>
            <p className="text-lg font-semibold text-text mb-2">{growth.name}</p>
            <p className="text-2xl font-bold text-amber-600">
              {results.domainScores[growth.id].toFixed(2)}
            </p>
            <p className="text-sm text-text-muted mt-3">
              This is an opportunity for growth. Focus on this domain to enhance your overall
              emotional intelligence and effectiveness.
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-primary/10 rounded-lg p-8 border border-primary/30 text-center">
          <h3 className="text-2xl font-bold text-primary mb-4 font-fraunces">
            What&apos;s Next?
          </h3>
          <p className="text-text-muted mb-6 max-w-2xl mx-auto">
            Your assessment results have been saved. Share them with your coach or mentor to
            develop an action plan for strengthening your emotional intelligence.
          </p>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-primary text-primary-fg font-medium rounded-lg hover:bg-primary-hover transition-colors"
          >
            Print or Save Results
          </button>
        </div>
      </div>
    </div>
  )
}
