'use client'

import { use } from 'react'
import Link from 'next/link'
import { Button, Card } from '@/components/ui'
import { Navbar } from '@/components/Navbar'
import { cn } from '@/lib/utils'
import type { Verse } from '@/types'

// Mock data - will be replaced with real data from JSON files
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

export default function SurahDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const surahId = parseInt(id, 10)

  // TODO: Fetch real surah data based on id
  console.log('Loading surah:', surahId)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              Start from Verse 1
            </Button>
          </Link>
        </div>

        {/* Verses List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Verses
            <span className="text-gray-500 font-normal ml-2">({mockVerses.length})</span>
          </h2>

          {mockVerses.map((verse, index) => (
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

                    {/* English Translation Preview */}
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {verse.textEnglish}
                    </p>
                  </div>

                  {/* Progress indicator (position in surah) */}
                  <div className="flex-shrink-0 text-xs text-gray-400">
                    {index + 1} of {mockVerses.length}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
