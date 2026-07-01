'use client'

interface Domain {
  id: number
  name: string
}

interface DomainBarsProps {
  scores: Record<string, number>
  domains: Domain[]
}

export default function DomainBars({ scores, domains }: DomainBarsProps) {
  const getBandColor = (score: number) => {
    if (score >= 4.0) return 'bg-success'
    if (score >= 3.0) return 'bg-amber-500'
    return 'bg-error'
  }

  const getBandLabel = (score: number) => {
    if (score >= 4.0) return 'High'
    if (score >= 3.0) return 'Moderate'
    return 'Needs Support'
  }

  return (
    <div className="space-y-6">
      {domains.map((domain) => {
        const score = scores[domain.id] || 0
        const percentage = (score / 5) * 100

        return (
          <div key={domain.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-medium text-text">{domain.name}</label>
              <span className="text-lg font-bold text-primary">{score.toFixed(2)}</span>
            </div>

            {/* Bar */}
            <div className="w-full h-8 bg-background rounded-lg overflow-hidden border border-border">
              <div
                className={`h-full transition-all duration-500 flex items-center justify-end pr-2 ${getBandColor(score)}`}
                style={{ width: `${percentage}%` }}
              >
                {percentage > 20 && (
                  <span className="text-xs font-semibold text-white">{getBandLabel(score)}</span>
                )}
              </div>
            </div>

            {/* Scale labels */}
            <div className="flex justify-between text-xs text-text-muted px-1">
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
