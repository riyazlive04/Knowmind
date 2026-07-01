// Web scoring adapter.
//
// The actual scoring logic lives in @knowmind/shared (single source of truth,
// canonical 5/5/5/5/5/2 domain mapping). This module adapts the canonical
// result into the numbered ({1..6}) shape the web UI components expect
// (DomainBars / DomainRadar / ResultsDisplay), so existing callers and the
// persisted submission.domain_scores shape are unchanged — only the (now
// correct) values differ.

import { scoreSubmission as scoreCanonical, toNumberedDomainScores } from '@knowmind/shared'

export interface ScoreResult {
  overall: number
  domainScores: Record<number, number>
  personalCompetence: number
  socialCompetence: number
  band: string
}

export function scoreSubmission(rawAnswers: number[]): ScoreResult {
  const result = scoreCanonical(rawAnswers)

  return {
    overall: result.overall,
    domainScores: toNumberedDomainScores(result.domain_scores),
    personalCompetence: result.personal_competence,
    socialCompetence: result.social_competence,
    band: result.bands.overall,
  }
}
