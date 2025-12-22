/**
 * Core type definitions for Qalam
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

// User's practice attempt
export interface Attempt {
  id: string
  verseId: string
  userId: string
  userTranslation: string
  score: number          // 0-1
  feedback: AttemptFeedback
  createdAt: Date
}

// Feedback from LLM evaluation
export interface AttemptFeedback {
  overallScore: number
  correctElements: string[]
  missedElements: string[]
  suggestions: string[]
  encouragement: string
}

// User progress stats
export interface UserProgress {
  totalAttempts: number
  uniqueVerses: number
  averageScore: number
  daysActive: number
  currentStreak: number
  bestScore: number
}

// Verse progress (per verse stats)
export interface VerseProgress {
  verseId: string
  attemptCount: number
  bestScore: number
  lastAttemptAt: Date
  averageScore: number
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Form states
export type FormStatus = 'idle' | 'loading' | 'success' | 'error'

// Navigation item
export interface NavItem {
  label: string
  href: string
  icon?: string
}
