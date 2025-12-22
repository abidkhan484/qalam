'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { ProgressStats } from '@/components/ProgressStats'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { UserProgress, Attempt } from '@/types'

// Mock data
const mockProgress: UserProgress = {
  totalAttempts: 42,
  uniqueVerses: 18,
  averageScore: 0.73,
  daysActive: 12,
  currentStreak: 5,
  bestScore: 0.95,
}

const mockAttempts: (Attempt & { surahName: string; verseNumber: number })[] = [
  {
    id: '1',
    verseId: '1:1',
    userId: 'user1',
    userTranslation: 'In the name of God, the most Gracious, the most Merciful',
    score: 0.85,
    feedback: { overallScore: 0.85, correctElements: [], missedElements: [], suggestions: [], encouragement: '' },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    surahName: 'Al-Fatihah',
    verseNumber: 1,
  },
  {
    id: '2',
    verseId: '1:2',
    userId: 'user1',
    userTranslation: 'All praise belongs to Allah, Lord of all worlds',
    score: 0.72,
    feedback: { overallScore: 0.72, correctElements: [], missedElements: [], suggestions: [], encouragement: '' },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    surahName: 'Al-Fatihah',
    verseNumber: 2,
  },
  {
    id: '3',
    verseId: '2:255',
    userId: 'user1',
    userTranslation: 'Allah, there is no god but He, the Living, the Self-subsisting',
    score: 0.91,
    feedback: { overallScore: 0.91, correctElements: [], missedElements: [], suggestions: [], encouragement: '' },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    surahName: 'Al-Baqarah',
    verseNumber: 255,
  },
  {
    id: '4',
    verseId: '1:3',
    userId: 'user1',
    userTranslation: 'The most gracious, the most merciful',
    score: 0.95,
    feedback: { overallScore: 0.95, correctElements: [], missedElements: [], suggestions: [], encouragement: '' },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    surahName: 'Al-Fatihah',
    verseNumber: 3,
  },
  {
    id: '5',
    verseId: '1:4',
    userId: 'user1',
    userTranslation: 'Master of the day of judgement',
    score: 0.88,
    feedback: { overallScore: 0.88, correctElements: [], missedElements: [], suggestions: [], encouragement: '' },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    surahName: 'Al-Fatihah',
    verseNumber: 4,
  },
]

const verseProgressData = [
  { verseId: '1:1', surahName: 'Al-Fatihah', verseNumber: 1, attempts: 5, bestScore: 0.92, lastAttempt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { verseId: '1:2', surahName: 'Al-Fatihah', verseNumber: 2, attempts: 3, bestScore: 0.78, lastAttempt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
  { verseId: '1:3', surahName: 'Al-Fatihah', verseNumber: 3, attempts: 4, bestScore: 0.95, lastAttempt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { verseId: '2:255', surahName: 'Al-Baqarah', verseNumber: 255, attempts: 2, bestScore: 0.91, lastAttempt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
]

function getScoreColor(score: number): string {
  if (score >= 0.9) return 'text-success-600 bg-success-50'
  if (score >= 0.7) return 'text-primary-600 bg-primary-50'
  if (score >= 0.5) return 'text-warning-600 bg-warning-50'
  return 'text-error-600 bg-error-50'
}

type TabType = 'history' | 'verses'

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<TabType>('history')

  return (
    <div className="container-wide py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
        <p className="text-gray-600 mt-1">
          Track your learning journey and see how you&apos;re improving
        </p>
      </div>

      {/* Stats Overview */}
      <ProgressStats progress={mockProgress} className="mb-8" />

      {/* Additional Stats Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Best Score Ever</p>
                <p className="text-3xl font-bold text-success-600">
                  {Math.round(mockProgress.bestScore * 100)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Days Active</p>
                <p className="text-3xl font-bold text-gray-900">
                  {mockProgress.daysActive}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'pb-4 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'history'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            Recent Attempts
          </button>
          <button
            onClick={() => setActiveTab('verses')}
            className={cn(
              'pb-4 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'verses'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            By Verse
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {mockAttempts.map((attempt) => (
            <Link key={attempt.id} href={`/progress/verse/${attempt.verseId.replace(':', '-')}`}>
              <Card hover>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {attempt.surahName} {attempt.verseNumber}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatRelativeTime(attempt.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      &quot;{attempt.userTranslation}&quot;
                    </p>
                  </div>
                  <span className={cn('px-3 py-1 rounded-full text-sm font-medium', getScoreColor(attempt.score))}>
                    {Math.round(attempt.score * 100)}%
                  </span>
                </div>
              </Card>
            </Link>
          ))}

          {mockAttempts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No attempts yet. Start practicing to track your progress!</p>
              <Link href="/browse" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
                Browse Surahs
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'verses' && (
        <div className="space-y-4">
          {verseProgressData.map((verse) => (
            <Link key={verse.verseId} href={`/progress/verse/${verse.verseId.replace(':', '-')}`}>
              <Card hover>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {verse.surahName} {verse.verseNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {verse.attempts} attempts · Last: {formatRelativeTime(verse.lastAttempt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Best Score</p>
                      <p className={cn('text-lg font-semibold', verse.bestScore >= 0.7 ? 'text-success-600' : 'text-warning-600')}>
                        {Math.round(verse.bestScore * 100)}%
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
