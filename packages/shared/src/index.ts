// @knowmind/shared — single source of truth for EI scoring & domain model.
//
// CANONICAL domain → item mapping (27 items, 6 domains): 5 / 5 / 5 / 5 / 5 / 2.
// This previously diverged between the web (4/4/4/4/5/6) and api (5/5/5/5/5/2)
// scoring engines, producing different scores for the same submission. Both apps
// now import from here so the mapping can only ever be defined once.

export type Band = 'High' | 'Moderate' | 'Needs Support'

export type DomainKey =
  | 'self_awareness'
  | 'self_regulation'
  | 'motivation'
  | 'empathy'
  | 'social_leadership'
  | 'relationship_intelligence'

export interface DomainScores {
  self_awareness: number
  self_regulation: number
  motivation: number
  empathy: number
  social_leadership: number
  relationship_intelligence: number
}

export interface ScoredSubmission {
  domain_scores: DomainScores
  overall: number
  personal_competence: number
  social_competence: number
  bands: {
    self_awareness: Band
    self_regulation: Band
    motivation: Band
    empathy: Band
    social_leadership: Band
    relationship_intelligence: Band
    overall: Band
    personal: Band
    social: Band
  }
}

// Display metadata. `id` is the stable 1-6 ordinal used by the web UI
// (radar / bars / numbered domain_scores map).
export const DOMAINS: ReadonlyArray<{ id: number; key: DomainKey; name: string }> = [
  { id: 1, key: 'self_awareness', name: 'Self-Awareness' },
  { id: 2, key: 'self_regulation', name: 'Self-Regulation' },
  { id: 3, key: 'motivation', name: 'Motivation' },
  { id: 4, key: 'empathy', name: 'Empathy' },
  { id: 5, key: 'social_leadership', name: 'Social & Leadership' },
  { id: 6, key: 'relationship_intelligence', name: 'Relationship Intelligence' },
]

// 1-indexed item numbers per domain.
export const DOMAIN_ITEM_RANGES: Record<DomainKey, number[]> = {
  self_awareness: [1, 2, 3, 4, 5],
  self_regulation: [6, 7, 8, 9, 10],
  motivation: [11, 12, 13, 14, 15],
  empathy: [16, 17, 18, 19, 20],
  social_leadership: [21, 22, 23, 24, 25],
  relationship_intelligence: [26, 27],
}

// Negatively-phrased items (1-indexed) that are reverse-scored.
export const REVERSE_ITEMS = [4, 8, 16]

export const TOTAL_ITEMS = 27

export function getBand(score: number): Band {
  if (score >= 4.0) return 'High'
  if (score >= 3.0) return 'Moderate'
  return 'Needs Support'
}

function reverseScore(score: number): number {
  return 6 - score
}

function calculateDomainMean(items: number[], itemNumbers: number[]): number {
  const domainItems = itemNumbers.map((itemNum) => items[itemNum - 1])
  const sum = domainItems.reduce((acc, val) => acc + val, 0)
  return sum / domainItems.length
}

export function scoreSubmission(rawAnswers: number[]): ScoredSubmission {
  if (rawAnswers.length !== TOTAL_ITEMS) {
    throw new Error(`Expected ${TOTAL_ITEMS} item answers`)
  }

  for (let i = 0; i < rawAnswers.length; i++) {
    const answer = rawAnswers[i]
    if (answer < 1 || answer > 5 || !Number.isInteger(answer)) {
      throw new Error(`Invalid answer at index ${i}: ${answer} (must be integer 1-5)`)
    }
  }

  // Apply reverse scoring on a copy.
  const processedAnswers = [...rawAnswers]
  REVERSE_ITEMS.forEach((itemNum) => {
    processedAnswers[itemNum - 1] = reverseScore(processedAnswers[itemNum - 1])
  })

  const domainScores: DomainScores = {
    self_awareness: calculateDomainMean(processedAnswers, DOMAIN_ITEM_RANGES.self_awareness),
    self_regulation: calculateDomainMean(processedAnswers, DOMAIN_ITEM_RANGES.self_regulation),
    motivation: calculateDomainMean(processedAnswers, DOMAIN_ITEM_RANGES.motivation),
    empathy: calculateDomainMean(processedAnswers, DOMAIN_ITEM_RANGES.empathy),
    social_leadership: calculateDomainMean(processedAnswers, DOMAIN_ITEM_RANGES.social_leadership),
    relationship_intelligence: calculateDomainMean(
      processedAnswers,
      DOMAIN_ITEM_RANGES.relationship_intelligence
    ),
  }

  const overall = Object.values(domainScores).reduce((a, b) => a + b, 0) / 6

  const personal_competence =
    (domainScores.self_awareness + domainScores.self_regulation + domainScores.motivation) / 3
  const social_competence =
    (domainScores.empathy +
      domainScores.social_leadership +
      domainScores.relationship_intelligence) /
    3

  return {
    domain_scores: domainScores,
    overall: parseFloat(overall.toFixed(2)),
    personal_competence: parseFloat(personal_competence.toFixed(2)),
    social_competence: parseFloat(social_competence.toFixed(2)),
    bands: {
      self_awareness: getBand(domainScores.self_awareness),
      self_regulation: getBand(domainScores.self_regulation),
      motivation: getBand(domainScores.motivation),
      empathy: getBand(domainScores.empathy),
      social_leadership: getBand(domainScores.social_leadership),
      relationship_intelligence: getBand(domainScores.relationship_intelligence),
      overall: getBand(overall),
      personal: getBand(personal_competence),
      social: getBand(social_competence),
    },
  }
}

export function validateDomainScores(domainScores: Partial<DomainScores>): DomainScores {
  const required: DomainKey[] = [
    'self_awareness',
    'self_regulation',
    'motivation',
    'empathy',
    'social_leadership',
    'relationship_intelligence',
  ]

  for (const domain of required) {
    if (domainScores[domain] === undefined) {
      throw new Error(`Missing domain score: ${domain}`)
    }
  }

  return domainScores as DomainScores
}

// Convert named domain scores into the 1-6 numbered map the web UI consumes
// (DomainBars / DomainRadar / ResultsDisplay).
export function toNumberedDomainScores(domainScores: DomainScores): Record<number, number> {
  const out: Record<number, number> = {}
  for (const d of DOMAINS) {
    out[d.id] = domainScores[d.key]
  }
  return out
}
