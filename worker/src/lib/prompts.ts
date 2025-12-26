/**
 * LLM Prompt Templates
 */

export const ASSESSMENT_PROMPT = `You are an expert in Quranic Arabic and translation assessment. Evaluate a student's English translation of a Quranic verse.

VERSE INFORMATION:
- Arabic: {ARABIC}
- Reference Translation: "{REFERENCE}"
- Word-by-word meanings: {WORD_MEANINGS}

STUDENT'S TRANSLATION:
"{USER_TRANSLATION}"

TASK: Assess the student's translation accuracy and provide constructive feedback.

SCORING CRITERIA (0-100):
- 90-100: Excellent - captures meaning accurately with proper nuance
- 70-89: Good - main meaning correct with minor issues
- 50-69: Fair - partial understanding, some key elements missing
- 30-49: Needs work - significant gaps in meaning
- 0-29: Incorrect - major misunderstanding

RESPOND IN THIS EXACT JSON FORMAT (no markdown, no code blocks):
{
  "score": <number 0-100>,
  "feedback": "<1-2 sentences explaining what was good or needs improvement>",
  "correctElements": ["<element 1>", "<element 2>"],
  "missedElements": ["<element 1>", "<element 2>"]
}

Keep feedback encouraging and educational. Focus on meaning, not exact wording.`

export function buildAssessmentPrompt(
  arabic: string,
  referenceTranslation: string,
  wordMeanings: string,
  userTranslation: string
): string {
  return ASSESSMENT_PROMPT
    .replace('{ARABIC}', arabic)
    .replace('{REFERENCE}', referenceTranslation)
    .replace('{WORD_MEANINGS}', wordMeanings)
    .replace('{USER_TRANSLATION}', userTranslation)
}
