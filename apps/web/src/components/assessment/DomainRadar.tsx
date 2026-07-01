'use client'

interface Domain {
  id: number
  name: string
}

interface DomainRadarProps {
  scores: Record<string, number>
  domains: Domain[]
}

export default function DomainRadar({ scores, domains }: DomainRadarProps) {
  const size = 300
  const center = size / 2
  const radius = 100
  const levels = 5

  // Calculate angles for hexagon (6 domains)
  const angle = (Math.PI * 2) / 6
  const points = domains.map((d, i) => {
    const a = angle * i - Math.PI / 2
    const score = Math.min(scores[d.id] || 0, 5) / 5
    const r = radius * score
    return {
      x: center + r * Math.cos(a),
      y: center + r * Math.sin(a),
      labelX: center + (radius + 30) * Math.cos(a),
      labelY: center + (radius + 30) * Math.sin(a),
      domain: d,
      score: scores[d.id] || 0,
    }
  })

  // Background hexagons
  const bgHexagons = Array.from({ length: levels }).map((_, i) => {
    const r = (radius / levels) * (i + 1)
    const hexPoints = Array.from({ length: 6 })
      .map((_, j) => {
        const a = angle * j - Math.PI / 2
        return `${center + r * Math.cos(a)},${center + r * Math.sin(a)}`
      })
      .join(' ')
    return hexPoints
  })

  // Axis lines
  const axisLines = Array.from({ length: 6 }).map((_, i) => {
    const a = angle * i - Math.PI / 2
    return {
      x2: center + radius * Math.cos(a),
      y2: center + radius * Math.sin(a),
    }
  })

  // Data polygon
  const dataPoints = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <svg width={size} height={size} className="w-full max-w-sm mx-auto">
      {/* Background hexagons */}
      {bgHexagons.map((hexPoints, i) => (
        <polygon
          key={`bg-${i}`}
          points={hexPoints}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="1"
          opacity="0.3"
        />
      ))}

      {/* Axis lines */}
      {axisLines.map((line, i) => (
        <line
          key={`axis-${i}`}
          x1={center}
          y1={center}
          x2={line.x2}
          y2={line.y2}
          stroke="var(--color-border)"
          strokeWidth="1"
          opacity="0.2"
        />
      ))}

      {/* Data polygon fill */}
      <polygon
        points={dataPoints}
        fill="rgb(139, 92, 246)"
        fillOpacity="0.2"
        stroke="rgb(139, 92, 246)"
        strokeWidth="2"
      />

      {/* Data points */}
      {points.map((p, i) => (
        <circle
          key={`point-${i}`}
          cx={p.x}
          cy={p.y}
          r="5"
          fill="rgb(139, 92, 246)"
          stroke="white"
          strokeWidth="2"
        />
      ))}

      {/* Labels */}
      {points.map((p, i) => (
        <g key={`label-${i}`}>
          <text
            x={p.labelX}
            y={p.labelY}
            textAnchor="middle"
            dy="0.3em"
            className="text-xs font-semibold fill-text"
          >
            {p.domain.name}
          </text>
          <text
            x={p.labelX}
            y={p.labelY + 15}
            textAnchor="middle"
            dy="0.3em"
            className="text-sm font-bold fill-primary"
          >
            {p.score.toFixed(2)}
          </text>
        </g>
      ))}

      {/* Center label */}
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dy="0.3em"
        className="text-xs fill-text-muted"
      >
        EI Profile
      </text>
    </svg>
  )
}
