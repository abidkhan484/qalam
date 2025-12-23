/**
 * Core type definitions for Qalam
 * Stateless knowledge application - no user accounts
 */

// Surah metadata
export interface Surah {
  id: number
  name: string           // English name
  nameArabic: string     // Arabic name
  meaning: string        // English meaning
  verseCount: number
  revelationType: 'Meccan' | 'Medinan'
}

// Individual verse
export interface Verse {
  id: string             // e.g., "1:1" (surah:ayah)
  surahId: number
  verseNumber: number
  textArabic: string
  textEnglish: string    // Reference translation
}

// Word analysis for a verse
export interface WordAnalysis {
  word: string           // Arabic word
  transliteration: string
  meaning: string
  root?: string          // Arabic root letters
  grammar?: string       // Grammatical notes
}

// Full verse analysis (pre-computed)
export interface VerseAnalysis {
  verseId: string
  words: WordAnalysis[]
  keyPhrases: string[]
  grammarNotes: string[]
}

// Feedback from LLM evaluation
export interface AttemptFeedback {
  overallScore: number
  correctElements: string[]
  missedElements: string[]
  suggestions: string[]
  encouragement: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Evaluation request
export interface EvaluateRequest {
  verseId: string
  userTranslation: string
}

// Evaluation response
export interface EvaluateResponse {
  feedback: AttemptFeedback
  referenceTranslation: string
  analysis: WordAnalysis[]
}

// Form states
export type FormStatus = 'idle' | 'loading' | 'success' | 'error'

// Navigation item
export interface NavItem {
  label: string
  href: string
}

// Session preferences (localStorage)
export interface UserPreferences {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge'
  showHints: boolean
  lastVerseId?: string
}
