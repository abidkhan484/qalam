/**
 * Assessment Handler
 * Fetches verse data, checks cache, calls LLM, and returns feedback
 */

import type { Env, AssessmentRequest, VerseAnalysis, AttemptFeedback, ApiResponse } from '../types'
import { buildAssessmentPrompt } from '../lib/prompts'
import { callLLM } from '../lib/llm'
import { getCachedAssessment, cacheAssessment } from '../lib/cache'

// Base URL for static data (the Qalam static site)
const DATA_BASE_URL = 'https://qalam.pages.dev/data'

/**
 * Fetch verse analysis from static JSON
 */
async function getVerseAnalysis(verseId: string): Promise<VerseAnalysis | null> {
  const fileName = verseId.replace(':', '-')
  const url = `${DATA_BASE_URL}/analysis/${fileName}.json`

  try {
    const response = await fetch(url)
    if (!response.ok) return null
    return await response.json() as VerseAnalysis
  } catch {
    return null
  }
}

/**
 * Fetch reference translation from quran.json
 */
async function getReferenceTranslation(verseId: string): Promise<string | null> {
  const [surahId, verseNum] = verseId.split(':').map(Number)

  try {
    const response = await fetch(`${DATA_BASE_URL}/quran.json`)
    if (!response.ok) return null

    const quranData = await response.json() as {
      surahs: Array<{
        id: number
        verses: Array<{
          number: number
          translations: { 'en.sahih': string }
        }>
      }>
    }

    const surah = quranData.surahs.find(s => s.id === surahId)
    if (!surah) return null

    const verse = surah.verses.find(v => v.number === verseNum)
    if (!verse) return null

    return verse.translations['en.sahih'] || null
  } catch {
    return null
  }
}

/**
 * Convert LLM result to AttemptFeedback format
 */
function toAttemptFeedback(score: number, feedback: string, correctElements: string[], missedElements: string[]): AttemptFeedback {
  const normalizedScore = score / 100

  let encouragement: string
  if (normalizedScore >= 0.9) {
    encouragement = 'Excellent work! Your translation beautifully captures the meaning of this verse.'
  } else if (normalizedScore >= 0.7) {
    encouragement = 'Great effort! You understood the verse well. Keep practicing to refine your skills.'
  } else if (normalizedScore >= 0.5) {
    encouragement = 'Good start! Review the word meanings and try again to improve your understanding.'
  } else {
    encouragement = 'Keep learning! Use the word analysis to understand each part of the verse.'
  }

  return {
    overallScore: normalizedScore,
    correctElements,
    missedElements,
    suggestions: [feedback],
    encouragement,
  }
}

/**
 * Main assessment handler
 */
export async function handleAssessment(
  request: Request,
  env: Env
): Promise<Response> {
  // Parse request
  let body: AssessmentRequest
  try {
    body = await request.json() as AssessmentRequest
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400)
  }

  const { verseId, userTranslation } = body

  // Validate input
  if (!verseId || !userTranslation?.trim()) {
    return jsonResponse({ success: false, error: 'Missing verseId or userTranslation' }, 400)
  }

  const trimmedTranslation = userTranslation.trim()

  // Check cache first
  const cached = await getCachedAssessment(env, verseId, trimmedTranslation)
  if (cached) {
    return jsonResponse({
      success: true,
      data: { feedback: cached },
      cached: true,
    })
  }

  // Fetch verse data
  const [analysis, referenceTranslation] = await Promise.all([
    getVerseAnalysis(verseId),
    getReferenceTranslation(verseId),
  ])

  if (!analysis) {
    return jsonResponse({ success: false, error: 'Verse analysis not available' }, 404)
  }

  if (!referenceTranslation) {
    return jsonResponse({ success: false, error: 'Reference translation not available' }, 404)
  }

  // Build prompt
  const wordMeanings = analysis.words
    .map(w => `${w.arabic} = "${w.meaning}"`)
    .join(', ')

  const prompt = buildAssessmentPrompt(
    analysis.verse.arabic,
    referenceTranslation,
    wordMeanings,
    trimmedTranslation
  )

  // Call LLM
  try {
    const result = await callLLM(prompt, env)
    const feedback = toAttemptFeedback(
      result.score,
      result.feedback,
      result.correctElements,
      result.missedElements
    )

    // Cache the result (async, don't await)
    cacheAssessment(env, verseId, trimmedTranslation, feedback)

    return jsonResponse({
      success: true,
      data: { feedback },
      cached: false,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'LLM request failed'
    return jsonResponse({ success: false, error: message }, 500)
  }
}

/**
 * Helper to create JSON response
 */
function jsonResponse(data: ApiResponse, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
