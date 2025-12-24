import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { VerseAnalysis, AttemptFeedback } from '@/types'

// Together.ai API configuration
const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions'
const TOGETHER_MODEL = process.env.TOGETHER_MODEL || 'meta-llama/Llama-3.3-70B-Instruct-Turbo'

interface AssessmentRequest {
  verseId: string
  userTranslation: string
}

interface AssessmentResponse {
  score: number
  feedback: string
  correctElements: string[]
  missedElements: string[]
}

/**
 * Load verse analysis from static JSON file
 */
async function getVerseAnalysisServer(verseId: string): Promise<VerseAnalysis | null> {
  const fileName = verseId.replace(':', '-')
  const filePath = path.join(process.cwd(), 'public', 'data', 'analysis', `${fileName}.json`)

  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

/**
 * Load reference translation from quran.json
 */
async function getReferenceTranslation(verseId: string): Promise<string | null> {
  const [surahId, verseNum] = verseId.split(':').map(Number)
  const filePath = path.join(process.cwd(), 'public', 'data', 'quran.json')

  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const quranData = JSON.parse(content)
    const surah = quranData.surahs.find((s: { id: number }) => s.id === surahId)
    if (!surah) return null

    const verse = surah.verses.find((v: { number: number }) => v.number === verseNum)
    if (!verse) return null

    return verse.translations['en.sahih'] || null
  } catch {
    return null
  }
}

/**
 * Build the prompt for Together.ai
 */
function buildPrompt(
  arabic: string,
  referenceTranslation: string,
  wordMeanings: string,
  userTranslation: string
): string {
  return `You are an expert in Quranic Arabic and translation assessment. Evaluate a student's English translation of a Quranic verse.

VERSE INFORMATION:
- Arabic: ${arabic}
- Reference Translation: "${referenceTranslation}"
- Word-by-word meanings: ${wordMeanings}

STUDENT'S TRANSLATION:
"${userTranslation}"

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
}

/**
 * Call Together.ai API
 */
async function callTogetherAI(prompt: string): Promise<AssessmentResponse> {
  const apiKey = process.env.TOGETHER_API_KEY

  if (!apiKey) {
    throw new Error('TOGETHER_API_KEY is not configured')
  }

  const response = await fetch(TOGETHER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: TOGETHER_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Together.ai API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('Empty response from Together.ai')
  }

  // Parse the JSON response
  try {
    // Clean up potential markdown code blocks
    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const parsed = JSON.parse(cleanedContent)

    return {
      score: Math.max(0, Math.min(100, parsed.score || 0)),
      feedback: parsed.feedback || 'Unable to generate feedback.',
      correctElements: Array.isArray(parsed.correctElements) ? parsed.correctElements : [],
      missedElements: Array.isArray(parsed.missedElements) ? parsed.missedElements : [],
    }
  } catch {
    // If JSON parsing fails, return a default response
    console.error('Failed to parse Together.ai response:', content)
    return {
      score: 50,
      feedback: 'Unable to parse assessment. Please try again.',
      correctElements: [],
      missedElements: [],
    }
  }
}

/**
 * Convert AI response to AttemptFeedback format
 */
function toAttemptFeedback(assessment: AssessmentResponse): AttemptFeedback {
  const score = assessment.score / 100 // Convert to 0-1 scale

  // Generate encouragement based on score
  let encouragement: string
  if (score >= 0.9) {
    encouragement = 'Excellent work! Your translation beautifully captures the meaning of this verse.'
  } else if (score >= 0.7) {
    encouragement = 'Great effort! You understood the verse well. Keep practicing to refine your skills.'
  } else if (score >= 0.5) {
    encouragement = 'Good start! Review the word meanings and try again to improve your understanding.'
  } else {
    encouragement = 'Keep learning! Use the word analysis to understand each part of the verse.'
  }

  return {
    overallScore: score,
    correctElements: assessment.correctElements,
    missedElements: assessment.missedElements,
    suggestions: [assessment.feedback],
    encouragement,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AssessmentRequest = await request.json()
    const { verseId, userTranslation } = body

    // Validate input
    if (!verseId || !userTranslation?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Missing verseId or userTranslation' },
        { status: 400 }
      )
    }

    // Load verse data server-side
    const [analysis, referenceTranslation] = await Promise.all([
      getVerseAnalysisServer(verseId),
      getReferenceTranslation(verseId),
    ])

    if (!analysis) {
      return NextResponse.json(
        { success: false, error: 'Verse analysis not available' },
        { status: 404 }
      )
    }

    if (!referenceTranslation) {
      return NextResponse.json(
        { success: false, error: 'Reference translation not available' },
        { status: 404 }
      )
    }

    // Build word meanings string from analysis
    const wordMeanings = analysis.words
      .map(w => `${w.arabic} = "${w.meaning}"`)
      .join(', ')

    // Build prompt and call Together.ai
    const prompt = buildPrompt(
      analysis.verse.arabic,
      referenceTranslation,
      wordMeanings,
      userTranslation.trim()
    )

    const assessment = await callTogetherAI(prompt)
    const feedback = toAttemptFeedback(assessment)

    return NextResponse.json({
      success: true,
      data: {
        feedback,
        referenceTranslation,
      },
    })
  } catch (error) {
    console.error('Assessment error:', error)

    const message = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
