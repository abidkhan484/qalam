/**
 * Seed Script: Generate verse analysis using local LLM (Ollama)
 *
 * Usage:
 *   npm run seed:analysis
 *
 * Environment variables:
 *   OLLAMA_BASE_URL - Ollama API endpoint (default: http://localhost:11434)
 *   OLLAMA_MODEL    - Model to use (default: qwen2.5:72b)
 *
 * Features:
 *   - Skips existing analysis files (resume capability)
 *   - Detailed progress logging
 *   - Sequential processing
 */

import * as fs from 'fs'
import * as path from 'path'

// Configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:72b'

// Paths
const PROJECT_ROOT = path.resolve(__dirname, '..')
const SURAHS_FILE = path.join(PROJECT_ROOT, 'public/data/surahs.json')
const ANALYSIS_DIR = path.join(PROJECT_ROOT, 'public/data/analysis')

// Types
interface Surah {
  id: number
  name: string
  nameArabic: string
  verseCount: number
}

// Analysis prompt template
const ANALYSIS_PROMPT = `You are an expert in Classical Arabic grammar (naḥw and ṣarf). Analyze the following Quranic verse word-by-word and return a JSON object.

IMPORTANT GUIDELINES:
- Focus ONLY on lexical and morphological analysis
- NO tafsīr, thematic, or theological interpretation
- Use academic transliteration (ḥ, ʿ, ā, ū, ī, etc.)
- Include full diacritical marks (tashkīl) for Arabic text
- Analyze compound words by listing their components

VERSE TO ANALYZE:
Surah: {SURAH_NAME}
Surah Number: {SURAH_NUMBER}
Verse Number: {VERSE_NUMBER}

Return ONLY a valid JSON object with this exact structure:

{
  "verseId": "{SURAH_NUMBER}:{VERSE_NUMBER}",
  "verse": {
    "arabic": "[Full Arabic text with tashkīl]",
    "transliteration": "[Academic transliteration]",
    "surah": "{SURAH_NAME}",
    "verseNumber": {VERSE_NUMBER}
  },
  "words": [
    {
      "wordNumber": 1,
      "arabic": "[Word with tashkīl]",
      "transliteration": "[transliteration]",
      "meaning": "[literal meaning]",
      "grammaticalCategory": "[e.g., definite noun (ism maʿrifa)]",
      "definiteness": "[e.g., definite (by al- prefix)]",
      "root": {
        "letters": "[e.g., ح-م-د]",
        "transliteration": "[e.g., ḥ-m-d]",
        "meaning": "[core root meaning]"
      },
      "morphology": {
        "pattern": "[Arabic pattern, e.g., فَعْل]",
        "patternTransliteration": "[e.g., faʿl]",
        "wordType": "[e.g., maṣdar (verbal noun)]",
        "note": "[optional additional info]"
      },
      "grammar": {
        "case": "[nominative (marfūʿ) | accusative (manṣūb) | genitive (majrūr)]",
        "caseMarker": "[e.g., ḍamma (ُ)]",
        "caseReason": "[why this case]",
        "gender": "[masculine | feminine]",
        "number": "[singular | dual | plural]"
      },
      "syntacticFunction": "[role in sentence, e.g., mubtadaʾ (subject)]",
      "components": [
        {
          "element": "[Arabic part]",
          "transliteration": "[transliteration]",
          "type": "[e.g., preposition (ḥarf jarr)]",
          "function": "[what it does]"
        }
      ],
      "semanticNote": "[optional: additional meaning context]"
    }
  ],
  "literalTranslation": {
    "wordAligned": "[Word-for-word with hyphens and [brackets] for implied words]",
    "preservingSyntax": "[Keeping Arabic order with transliterated terms]"
  },
  "rootSummary": [
    {
      "word": "[Arabic word]",
      "transliteration": "[transliteration]",
      "root": "[ح-م-د (ḥ-m-d)]",
      "coreMeaning": "[core meaning of root]",
      "derivedMeaning": "[meaning of this derived word]"
    }
  ],
  "grammarObservations": {
    "sentenceType": {
      "classification": "[jumla ismiyya (nominal) | jumla fiʿliyya (verbal)]",
      "mubtada": "[subject if nominal]",
      "khabar": "[predicate if nominal]"
    },
    "idafaConstructions": [
      {
        "description": "[describe the construct]",
        "mudaf": "[first term]",
        "mudafIlayhi": "[second term]"
      }
    ],
    "notes": [
      "[grammatical observations about the verse]"
    ]
  },
  "metadata": {
    "analysisType": "lexical and morphological",
    "linguisticFramework": "Classical Arabic grammar (naḥw, ṣarf)",
    "scope": "no tafsīr, thematic, or theological interpretation"
  }
}

Return ONLY the JSON object, no additional text or markdown.`

/**
 * Call Ollama API to generate analysis
 */
async function callOllama(prompt: string): Promise<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.3, // Lower temperature for more consistent JSON output
        num_predict: 4096, // Allow longer responses for detailed analysis
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.response
}

/**
 * Extract JSON from LLM response (handles markdown code blocks)
 */
function extractJson(response: string): object {
  // Try to parse directly first
  try {
    return JSON.parse(response.trim())
  } catch {
    // Try to extract from markdown code block
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim())
    }

    // Try to find JSON object in response
    const objectMatch = response.match(/\{[\s\S]*\}/)
    if (objectMatch) {
      return JSON.parse(objectMatch[0])
    }

    throw new Error('Could not extract valid JSON from response')
  }
}

/**
 * Generate analysis for a single verse
 */
async function generateVerseAnalysis(
  surah: Surah,
  verseNumber: number
): Promise<object> {
  const prompt = ANALYSIS_PROMPT
    .replace(/{SURAH_NAME}/g, surah.name)
    .replace(/{SURAH_NUMBER}/g, surah.id.toString())
    .replace(/{VERSE_NUMBER}/g, verseNumber.toString())

  const response = await callOllama(prompt)
  return extractJson(response)
}

/**
 * Check if analysis file already exists
 */
function analysisExists(surahId: number, verseNumber: number): boolean {
  const filePath = path.join(ANALYSIS_DIR, `${surahId}-${verseNumber}.json`)
  return fs.existsSync(filePath)
}

/**
 * Save analysis to file
 */
function saveAnalysis(surahId: number, verseNumber: number, analysis: object): void {
  const filePath = path.join(ANALYSIS_DIR, `${surahId}-${verseNumber}.json`)
  fs.writeFileSync(filePath, JSON.stringify(analysis, null, 2))
}

/**
 * Format duration in human readable format
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

/**
 * Main seed function
 */
async function main() {
  console.log('='.repeat(60))
  console.log('Qalam Verse Analysis Seeder')
  console.log('='.repeat(60))
  console.log(`Ollama URL:   ${OLLAMA_BASE_URL}`)
  console.log(`Model:        ${OLLAMA_MODEL}`)
  console.log(`Output:       ${ANALYSIS_DIR}`)
  console.log('='.repeat(60))
  console.log('')

  // Ensure analysis directory exists
  if (!fs.existsSync(ANALYSIS_DIR)) {
    fs.mkdirSync(ANALYSIS_DIR, { recursive: true })
  }

  // Load surahs
  const surahs: Surah[] = JSON.parse(fs.readFileSync(SURAHS_FILE, 'utf-8'))

  // Calculate totals
  const totalVerses = surahs.reduce((sum, s) => sum + s.verseCount, 0)
  let processedCount = 0
  let skippedCount = 0
  let errorCount = 0
  const startTime = Date.now()

  console.log(`Total surahs: ${surahs.length}`)
  console.log(`Total verses: ${totalVerses}`)
  console.log('')

  // Process each surah
  for (const surah of surahs) {
    console.log(`\n${'─'.repeat(50)}`)
    console.log(`📖 Surah ${surah.id}: ${surah.name} (${surah.nameArabic})`)
    console.log(`   Verses: ${surah.verseCount}`)
    console.log('─'.repeat(50))

    // Process each verse
    for (let verseNum = 1; verseNum <= surah.verseCount; verseNum++) {
      const verseId = `${surah.id}:${verseNum}`
      const currentTotal = processedCount + skippedCount + errorCount + 1
      const progress = ((currentTotal / totalVerses) * 100).toFixed(1)

      // Check if already exists
      if (analysisExists(surah.id, verseNum)) {
        skippedCount++
        console.log(`   ⏭️  [${progress}%] ${verseId} - Skipped (exists)`)
        continue
      }

      // Generate analysis
      const verseStart = Date.now()
      process.stdout.write(`   ⏳ [${progress}%] ${verseId} - Generating...`)

      try {
        const analysis = await generateVerseAnalysis(surah, verseNum)
        saveAnalysis(surah.id, verseNum, analysis)
        processedCount++

        const duration = Date.now() - verseStart
        console.log(`\r   ✅ [${progress}%] ${verseId} - Done (${formatDuration(duration)})`)
      } catch (error) {
        errorCount++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.log(`\r   ❌ [${progress}%] ${verseId} - Error: ${errorMessage}`)

        // Log error to file for debugging
        const errorLogPath = path.join(ANALYSIS_DIR, '_errors.log')
        fs.appendFileSync(
          errorLogPath,
          `[${new Date().toISOString()}] ${verseId}: ${errorMessage}\n`
        )
      }
    }
  }

  // Summary
  const totalDuration = Date.now() - startTime
  console.log('\n' + '='.repeat(60))
  console.log('SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Processed: ${processedCount}`)
  console.log(`⏭️  Skipped:   ${skippedCount}`)
  console.log(`❌ Errors:    ${errorCount}`)
  console.log(`⏱️  Duration:  ${formatDuration(totalDuration)}`)
  console.log('='.repeat(60))

  if (errorCount > 0) {
    console.log(`\n⚠️  Check ${path.join(ANALYSIS_DIR, '_errors.log')} for error details`)
  }

  process.exit(errorCount > 0 ? 1 : 0)
}

// Run
main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
