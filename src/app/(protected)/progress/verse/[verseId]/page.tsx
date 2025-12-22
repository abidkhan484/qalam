'use client'

import { use } from 'react'
import Link from 'next/link'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { VerseDisplay } from '@/components/VerseDisplay'
import { cn, formatRelativeTime } from '@/lib/utils'

// Mock data
const mockVerse = {
  id: '1:1',
  surahId: 1,
  surahName: 'Al-Fatihah',
  verseNumber: 1,
  textArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  textEnglish: 'In the name of Allah, the Most Gracious, the Most Merciful.',
}

const mockAttempts = [
  {
    id: '1',
    userTranslation: 'In the name of God, the most Gracious, the most Merciful',
    score: 0.92,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    feedback: {
      correctElements: ['Captured the core meaning', 'Good use of capitalization for divine attributes'],
      missedElements: ['Consider using "Allah" instead of "God"'],
    },
  },
  {
    id: '2',
    userTranslation: 'By the name of Allah, the Gracious, the Merciful',
    score: 0.78,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    feedback: {
      correctElements: ['Used "Allah" correctly'],
      missedElements: ['Missing "Most" before Gracious and Merciful', '"By" should be "In"'],
    },
  },
  {
    id: '3',
    userTranslation: 'In the name of God who is merciful and gracious',
    score: 0.65,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    feedback: {
      correctElements: ['Core meaning present'],
      missedElements: ['Attributes should be noun forms', 'Missing superlative "Most"', 'Order is reversed'],
    },
  },
]

const mockStats = {
  totalAttempts: 3,
  bestScore: 0.92,
  averageScore: 0.78,
  improvement: 0.27, // from first to last
}

function getScoreColor(score: number): string {
  if (score >= 0.9) return 'text-success-600 bg-success-50'
  if (score >= 0.7) return 'text-primary-600 bg-primary-50'
  if (score >= 0.5) return 'text-warning-600 bg-warning-50'
  return 'text-error-600 bg-error-50'
}

export default function VerseProgressPage({ params }: { params: Promise<{ verseId: string }> }) {
  const { verseId } = use(params)
  // Convert verseId from "1-1" back to "1:1" format
  const formattedVerseId = verseId.replace('-', ':')
  console.log('Loading verse progress:', formattedVerseId)

  return (
    <div className="container-narrow py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-gray-500">
          <li>
            <Link href="/progress" className="hover:text-gray-700">
              Progress
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">
            {mockVerse.surahName} {mockVerse.verseNumber}
          </li>
        </ol>
      </nav>

      {/* Verse Display */}
      <VerseDisplay
        arabic={mockVerse.textArabic}
        surahName={mockVerse.surahName}
        verseNumber={mockVerse.verseNumber}
        size="lg"
        className="mb-6"
      />

      {/* Reference Translation */}
      <Card className="mb-8 border-l-4 border-l-primary-500">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-500 mb-1">Reference Translation</p>
          <p className="text-gray-800">{mockVerse.textEnglish}</p>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-gray-900">{mockStats.totalAttempts}</p>
            <p className="text-sm text-gray-500">Attempts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-success-600">{Math.round(mockStats.bestScore * 100)}%</p>
            <p className="text-sm text-gray-500">Best Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-primary-600">{Math.round(mockStats.averageScore * 100)}%</p>
            <p className="text-sm text-gray-500">Average</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-success-600">+{Math.round(mockStats.improvement * 100)}%</p>
            <p className="text-sm text-gray-500">Improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Practice Button */}
      <div className="mb-8">
        <Link href={`/practice?verseId=${mockVerse.id}`}>
          <Button className="w-full" size="lg">
            Practice This Verse Again
          </Button>
        </Link>
      </div>

      {/* Attempt History */}
      <Card>
        <CardHeader>
          <CardTitle>Your Attempts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {mockAttempts.map((attempt, index) => (
            <div
              key={attempt.id}
              className={cn(
                'pb-6',
                index < mockAttempts.length - 1 && 'border-b border-gray-100'
              )}
            >
              {/* Attempt Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">
                  {formatRelativeTime(attempt.createdAt)}
                </span>
                <span className={cn('px-3 py-1 rounded-full text-sm font-medium', getScoreColor(attempt.score))}>
                  {Math.round(attempt.score * 100)}%
                </span>
              </div>

              {/* User Translation */}
              <p className="text-gray-700 italic mb-4">
                &quot;{attempt.userTranslation}&quot;
              </p>

              {/* Feedback Summary */}
              <div className="grid md:grid-cols-2 gap-4">
                {attempt.feedback.correctElements.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-success-600 mb-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Correct
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {attempt.feedback.correctElements.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-success-500">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {attempt.feedback.missedElements.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-warning-600 mb-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      To Improve
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {attempt.feedback.missedElements.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-warning-500">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
