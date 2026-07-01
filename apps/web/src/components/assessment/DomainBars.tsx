'use client'

import { tokens } from '@/lib/tokens'

interface Domain {
  id: number
  name: string
}

interface DomainBarsProps {
  scores: Record<string, number>
  domains: Domain[]
}

export default function DomainBars({ scores, domains }: DomainBarsProps) {
  // Brand band colors (never red) — strong=green, emerging=purple, developing=gold
  const getBandColor = (score: number) => {
    if (score >= 4.0) return tokens.band.strong
    if (score >= 3.0) return tokens.band.emerging
    return tokens.band.developing
  }

  const getBandLabel = (score: number) => {
    if (score >= 4.0) return 'Strong'
    if (score >= 3.0) return 'Emerging'
    return 'Developing'
  }

  return (
    <div className="space-y-6">
      {domains.map((domain) => {
        const score = scores[domain.id] || 0
        const percentage = (score / 5) * 100

        return (
          <div key={domain.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-medium text-ink-700">{domain.name}</label>
              <span className="text-lg font-display font-bold text-purple-800">{score.toFixed(2)}</span>
            </div>

            {/* Bar */}
            <div className="w-full h-8 bg-purple-50 rounded-md overflow-hidden border border-ink-100">
              <div
                className="h-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${percentage}%`, backgroundColor: getBandColor(score) }}
              >
                {percentage > 20 && (
                  <span className="text-xs font-semibold text-white">{getBandLabel(score)}</span>
                )}
              </div>
            </div>

            {/* Scale labels */}
            <div className="flex justify-between text-xs text-ink-400 px-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
