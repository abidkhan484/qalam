'use client'

import { use } from 'react'
import Link from 'next/link'
import { Button, Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Verse } from '@/types'

// Mock data - will be replaced with real data
const mockSurah = {
  id: 1,
  name: 'Al-Fatihah',
  nameArabic: 'الفاتحة',
  meaning: 'The Opening',
  verseCount: 7,
  revelationType: 'Meccan' as const,
}

const mockVerses: Verse[] = [
  { id: '1:1', surahId: 1, verseNumber: 1, textArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', textEnglish: 'In the name of Allah, the Most Gracious, the Most Merciful.' },
  { id: '1:2', surahId: 1, verseNumber: 2, textArabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', textEnglish: 'All praise is due to Allah, Lord of the worlds.' },
  { id: '1:3', surahId: 1, verseNumber: 3, textArabic: 'الرَّحْمَٰنِ الرَّحِيمِ', textEnglish: 'The Most Gracious, the Most Merciful.' },
  { id: '1:4', surahId: 1, verseNumber: 4, textArabic: 'مَالِكِ يَوْمِ الدِّينِ', textEnglish: 'Master of the Day of Judgment.' },
  { id: '1:5', surahId: 1, verseNumber: 5, textArabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', textEnglish: 'You alone we worship, and You alone we ask for help.' },
  { id: '1:6', surahId: 1, verseNumber: 6, textArabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', textEnglish: 'Guide us on the Straight Path.' },
  { id: '1:7', surahId: 1, verseNumber: 7, textArabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', textEnglish: 'The path of those You have blessed, not of those who earned Your anger, nor of those who went astray.' },
]

// Mock user progress for this surah
const mockProgress: Record<string, { attempts: number; bestScore: number }> = {
  '1:1': { attempts: 5, bestScore: 0.92 },
  '1:2': { attempts: 3, bestScore: 0.78 },
  '1:3': { attempts: 2, bestScore: 0.85 },
}

function getProgressBadge(verseId: string): React.ReactNode {
  const progress = mockProgress[verseId]
  if (!progress) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
        Not practiced
      </span>
    )
  }

  const scorePercent = Math.round(progress.bestScore * 100)
  const colorClass =
    scorePercent >= 90
      ? 'bg-success-50 text-success-700'
      : scorePercent >= 70
      ? 'bg-primary-50 text-primary-700'
      : 'bg-warning-50 text-warning-700'

  return (
    <span className={cn('text-xs px-2 py-1 rounded-full', colorClass)}>
      Best: {scorePercent}%
    </span>
  )
}

export default function SurahDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const surahId = parseInt(id, 10)

  // TODO: Fetch real surah data based on id
  console.log('Loading surah:', surahId)

  return (
    <div className="container-wide py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-gray-500">
          <li>
            <Link href="/browse" className="hover:text-gray-700">
              Browse
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{mockSurah.name}</li>
        </ol>
      </nav>

      {/* Surah Header */}
      <div className="bg-gradient-hero pattern-overlay text-white rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-primary-200 text-sm">Surah {mockSurah.id}</span>
              <span className={cn(
                'text-xs px-2 py-1 rounded-full',
                mockSurah.revelationType === 'Meccan' ? 'bg-amber-500/20 text-amber-200' : 'bg-blue-500/20 text-blue-200'
              )}>
                {mockSurah.revelationType}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-1">{mockSurah.name}</h1>
            <p className="text-primary-100">{mockSurah.meaning}</p>
          </div>
          <div className="text-right">
            <p className="font-arabic text-4xl mb-2" dir="rtl">
              {mockSurah.nameArabic}
            </p>
            <p className="text-primary-200 text-sm">{mockSurah.verseCount} verses</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Link href={`/practice?verseId=${mockSurah.id}:1`} className="flex-1">
          <Button className="w-full" size="lg">
            Start from Beginning
          </Button>
        </Link>
        <Button variant="outline" className="flex-1" size="lg">
          Continue Where I Left Off
        </Button>
      </div>

      {/* Verses List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Verses</h2>

        {mockVerses.map((verse) => (
          <Link key={verse.id} href={`/practice?verseId=${verse.id}`}>
            <Card hover className="group">
              <div className="flex items-start gap-4">
                {/* Verse Number */}
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 transition-colors">
                  <span className="text-primary-700 font-semibold text-sm">{verse.verseNumber}</span>
                </div>

                {/* Verse Content */}
                <div className="flex-1 min-w-0">
                  {/* Arabic */}
                  <p
                    className="font-arabic text-xl text-gray-900 leading-loose mb-2"
                    dir="rtl"
                    lang="ar"
                  >
                    {verse.textArabic}
                  </p>

                  {/* English Translation Preview (hidden, shown on hover/focus) */}
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {verse.textEnglish}
                  </p>
                </div>

                {/* Progress Badge */}
                <div className="flex-shrink-0">
                  {getProgressBadge(verse.id)}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Progress Summary */}
      <Card className="mt-8 bg-gray-50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">Your Progress</h3>
            <p className="text-sm text-gray-500">
              {Object.keys(mockProgress).length} of {mockVerses.length} verses practiced
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(mockProgress).reduce((sum, p) => sum + p.attempts, 0)}
              </p>
              <p className="text-gray-500">Total Attempts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">
                {Math.round(
                  (Object.values(mockProgress).reduce((sum, p) => sum + p.bestScore, 0) /
                    Object.keys(mockProgress).length) *
                    100
                )}%
              </p>
              <p className="text-gray-500">Average Best</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
