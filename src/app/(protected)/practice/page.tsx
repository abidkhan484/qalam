'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, Card, CardHeader, CardTitle, CardContent, Textarea, Alert } from '@/components/ui'
import { VerseDisplay } from '@/components/VerseDisplay'
import { FeedbackCard } from '@/components/FeedbackCard'
import type { AttemptFeedback, WordAnalysis } from '@/types'

// Mock verse data - will be replaced with real data
const mockVerse = {
  id: '1:1',
  surahId: 1,
  surahName: 'Al-Fatihah',
  verseNumber: 1,
  textArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  textEnglish: 'In the name of Allah, the Most Gracious, the Most Merciful.',
}

const mockAnalysis: WordAnalysis[] = [
  { word: 'بِسْمِ', transliteration: 'bismi', meaning: 'In the name of', root: 'س-م-و', grammar: 'Preposition + noun' },
  { word: 'اللَّهِ', transliteration: 'Allāhi', meaning: 'Allah/God', grammar: 'Proper noun, genitive case' },
  { word: 'الرَّحْمَٰنِ', transliteration: 'ar-Raḥmāni', meaning: 'The Most Gracious', root: 'ر-ح-م', grammar: 'Adjective/Name, genitive' },
  { word: 'الرَّحِيمِ', transliteration: 'ar-Raḥīmi', meaning: 'The Most Merciful', root: 'ر-ح-م', grammar: 'Adjective/Name, genitive' },
]

// Mock feedback - will be replaced with LLM response
const mockFeedback: AttemptFeedback = {
  overallScore: 0.85,
  correctElements: [
    'Correctly identified "In the name of" for بِسْمِ',
    'Proper recognition of Allah as the subject',
    'Good understanding of the merciful attributes',
  ],
  missedElements: [
    'Consider using "the Most Gracious" instead of just "Gracious"',
  ],
  suggestions: [
    'The definite article "the" is important in Arabic divine names',
    'Both الرَّحْمَٰنِ and الرَّحِيمِ derive from the root ر-ح-م meaning mercy',
  ],
  encouragement: 'Great effort! Your translation captures the essence of this beautiful opening verse.',
}

type ViewState = 'practice' | 'feedback' | 'analysis'

export default function PracticePage() {
  const [userTranslation, setUserTranslation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewState, setViewState] = useState<ViewState>('practice')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!userTranslation.trim()) {
      setError('Please enter your translation before submitting.')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      // TODO: Call evaluation API
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setViewState('feedback')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTryAgain = () => {
    setUserTranslation('')
    setViewState('practice')
  }

  const handleNextVerse = () => {
    // TODO: Navigate to next verse
    setUserTranslation('')
    setViewState('practice')
  }

  return (
    <div className="container-narrow py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-gray-500">
          <li>
            <Link href="/browse" className="hover:text-gray-700">
              Browse
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/browse/surah/${mockVerse.surahId}`} className="hover:text-gray-700">
              {mockVerse.surahName}
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">Verse {mockVerse.verseNumber}</li>
        </ol>
      </nav>

      {/* Verse Display */}
      <VerseDisplay
        arabic={mockVerse.textArabic}
        surahName={mockVerse.surahName}
        verseNumber={mockVerse.verseNumber}
        size="xl"
        className="mb-8"
      />

      {/* Practice/Feedback Content */}
      {viewState === 'practice' && (
        <Card>
          <CardHeader>
            <CardTitle>Write Your Translation</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="error" className="mb-4" onDismiss={() => setError('')}>
                {error}
              </Alert>
            )}

            <Textarea
              placeholder="Enter your translation of the verse above..."
              value={userTranslation}
              onChange={(e) => setUserTranslation(e.target.value)}
              className="min-h-[150px] text-lg"
            />

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                className="flex-1"
                size="lg"
              >
                Submit Translation
              </Button>
              <Button
                variant="ghost"
                onClick={() => setViewState('analysis')}
                className="flex-1"
              >
                Show Word Analysis
              </Button>
            </div>

            <p className="mt-4 text-sm text-gray-500 text-center">
              Tip: Focus on conveying the meaning accurately rather than word-for-word translation.
            </p>
          </CardContent>
        </Card>
      )}

      {viewState === 'feedback' && (
        <div className="space-y-6">
          {/* User's Translation */}
          <Card>
            <CardHeader>
              <CardTitle>Your Translation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-lg italic">&quot;{userTranslation}&quot;</p>
            </CardContent>
          </Card>

          {/* Reference Translation */}
          <Card className="border-l-4 border-l-primary-500">
            <CardHeader>
              <CardTitle>Reference Translation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-lg">{mockVerse.textEnglish}</p>
            </CardContent>
          </Card>

          {/* Feedback */}
          <FeedbackCard feedback={mockFeedback} />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleTryAgain} variant="outline" className="flex-1" size="lg">
              Try Again
            </Button>
            <Button onClick={() => setViewState('analysis')} variant="outline" className="flex-1" size="lg">
              View Word Analysis
            </Button>
            <Button onClick={handleNextVerse} className="flex-1" size="lg">
              Next Verse
            </Button>
          </div>
        </div>
      )}

      {viewState === 'analysis' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Word-by-Word Analysis</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewState(userTranslation ? 'feedback' : 'practice')}
              >
                Back
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-right font-medium text-gray-500 text-sm">Arabic</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500 text-sm">Transliteration</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500 text-sm">Meaning</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500 text-sm">Root</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500 text-sm">Grammar</th>
                  </tr>
                </thead>
                <tbody>
                  {mockAnalysis.map((word, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-right font-arabic text-xl text-gray-900" dir="rtl">
                        {word.word}
                      </td>
                      <td className="py-4 px-4 text-gray-700 italic">
                        {word.transliteration}
                      </td>
                      <td className="py-4 px-4 text-gray-900 font-medium">
                        {word.meaning}
                      </td>
                      <td className="py-4 px-4 text-gray-600 font-arabic" dir="rtl">
                        {word.root || '—'}
                      </td>
                      <td className="py-4 px-4 text-gray-500 text-sm">
                        {word.grammar || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-center">
              <Button onClick={() => setViewState('practice')}>
                Return to Practice
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
