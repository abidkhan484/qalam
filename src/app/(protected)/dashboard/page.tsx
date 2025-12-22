import Link from 'next/link'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { ProgressStats } from '@/components/ProgressStats'
import type { UserProgress } from '@/types'

// Mock data - will be replaced with real data from API
const mockProgress: UserProgress = {
  totalAttempts: 42,
  uniqueVerses: 18,
  averageScore: 0.73,
  daysActive: 12,
  currentStreak: 5,
  bestScore: 0.95,
}

const recentAttempts = [
  { id: '1', surah: 'Al-Fatihah', verse: 3, score: 0.85, timeAgo: '2 hours ago' },
  { id: '2', surah: 'Al-Fatihah', verse: 2, score: 0.72, timeAgo: '3 hours ago' },
  { id: '3', surah: 'Al-Baqarah', verse: 1, score: 0.91, timeAgo: 'Yesterday' },
]

const suggestedVerses = [
  { id: '1:4', surah: 'Al-Fatihah', verse: 4, reason: 'Continue where you left off' },
  { id: '1:5', surah: 'Al-Fatihah', verse: 5, reason: 'Next verse in sequence' },
  { id: '2:255', surah: 'Al-Baqarah', verse: 255, reason: 'Ayatul Kursi - Popular verse' },
]

function getScoreColor(score: number): string {
  if (score >= 0.9) return 'text-success-600 bg-success-50'
  if (score >= 0.7) return 'text-primary-600 bg-primary-50'
  if (score >= 0.5) return 'text-warning-600 bg-warning-50'
  return 'text-error-600 bg-error-50'
}

export default function DashboardPage() {
  return (
    <div className="container-wide py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Assalamu Alaikum
        </h1>
        <p className="text-gray-600 mt-1">
          Continue your journey of understanding the Quran
        </p>
      </div>

      {/* Stats Overview */}
      <ProgressStats progress={mockProgress} className="mb-8" />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Continue Practice */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Practice Card */}
          <Card>
            <CardHeader>
              <CardTitle>Ready to Practice?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Pick up where you left off or start with a new verse.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/practice?verseId=1:4" className="flex-1">
                  <Button className="w-full" size="lg">
                    Continue Learning
                  </Button>
                </Link>
                <Link href="/browse" className="flex-1">
                  <Button variant="outline" className="w-full" size="lg">
                    Browse Surahs
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Attempts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Attempts</CardTitle>
                <Link
                  href="/progress"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentAttempts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No attempts yet. Start practicing to see your history!
                </p>
              ) : (
                <div className="space-y-3">
                  {recentAttempts.map((attempt) => (
                    <Link
                      key={attempt.id}
                      href={`/progress/verse/${attempt.surah.toLowerCase().replace('-', '')}-${attempt.verse}`}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {attempt.surah} {attempt.verse}
                        </p>
                        <p className="text-sm text-gray-500">{attempt.timeAgo}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
                          attempt.score
                        )}`}
                      >
                        {Math.round(attempt.score * 100)}%
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Suggested */}
        <div className="space-y-6">
          {/* Suggested Verses */}
          <Card>
            <CardHeader>
              <CardTitle>Suggested Verses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestedVerses.map((verse) => (
                <Link
                  key={verse.id}
                  href={`/practice?verseId=${verse.id}`}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-colors"
                >
                  <p className="font-medium text-gray-900">
                    {verse.surah} {verse.verse}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{verse.reason}</p>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-bold">{mockProgress.currentStreak} Days</p>
                  <p className="text-primary-100">Current Streak</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-primary-100">
                Keep it up! Practice daily to maintain your streak.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
