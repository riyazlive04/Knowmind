// Client-side scoring engine (mirrors backend Phase 1)

export interface ScoreResult {
  overall: number
  domainScores: Record<number, number>
  personalCompetence: number
  socialCompetence: number
  band: string
}

export function scoreSubmission(rawAnswers: number[]): ScoreResult {
  // Reverse-coded items: 4, 8, 16 (1-indexed, so indices 3, 7, 15)
  const reverseItems = [3, 7, 15]
  
  const answers = rawAnswers.map((answer, idx) => {
    if (reverseItems.includes(idx)) {
      // Reverse: 1→5, 2→4, 3→3, 4→2, 5→1
      return 6 - answer
    }
    return answer
  })

  // Domain ranges (1-indexed questions mapped to 0-indexed array)
  // Domain 1: Items 1-4 (indices 0-3)
  // Domain 2: Items 5-8 (indices 4-7)
  // Domain 3: Items 9-12 (indices 8-11)
  // Domain 4: Items 13-16 (indices 12-15)
  // Domain 5: Items 17-21 (indices 16-20)
  // Domain 6: Items 22-27 (indices 21-26)

  const domainScores: Record<number, number> = {}

  domainScores[1] = (answers[0] + answers[1] + answers[2] + answers[3]) / 4 // Self-Awareness
  domainScores[2] = (answers[4] + answers[5] + answers[6] + answers[7]) / 4 // Self-Regulation
  domainScores[3] = (answers[8] + answers[9] + answers[10] + answers[11]) / 4 // Motivation
  domainScores[4] = (answers[12] + answers[13] + answers[14] + answers[15]) / 4 // Empathy
  domainScores[5] = (answers[16] + answers[17] + answers[18] + answers[19] + answers[20]) / 5 // Social & Leadership
  domainScores[6] = (answers[21] + answers[22] + answers[23] + answers[24] + answers[25] + answers[26]) / 6 // Relationship Intelligence

  // Personal competence: domains 1, 2, 3
  const personalCompetence = (domainScores[1] + domainScores[2] + domainScores[3]) / 3

  // Social competence: domains 4, 5, 6
  const socialCompetence = (domainScores[4] + domainScores[5] + domainScores[6]) / 3

  // Overall score: average of all domains
  const overall = Object.values(domainScores).reduce((a, b) => a + b, 0) / 6

  // Determine band
  let band = 'Needs Support'
  if (overall >= 4.0) band = 'High'
  else if (overall >= 3.0) band = 'Moderate'

  return {
    overall,
    domainScores,
    personalCompetence,
    socialCompetence,
    band,
  }
}
