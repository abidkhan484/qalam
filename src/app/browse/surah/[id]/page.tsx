'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { Button, Card, Spinner, Alert } from '@/components/ui'
import { Navbar } from '@/components/Navbar'
import { cn } from '@/lib/utils'
import { getSurahById } from '@/lib/data'
import type { Surah, Verse } from '@/types'

type SurahWithVerses = Surah & { verses: Verse[] }

export default function SurahDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const surahId = parseInt(id, 10)

  const [surah, setSurah] = useState<SurahWithVerses | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSurah() {
      try {
        const data = await getSurahById(surahId)
        if (data) {
          setSurah(data)
        } else {
          setError('Surah data not available yet. Check back soon!')
        }
      } catch (err) {
        console.error('Failed to load surah:', err)
        setError('Failed to load surah data.')
      } finally {
        setLoading(false)
      }
    }
    loadSurah()
  }, [surahId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        </main>
      </div>
    )
  }

  if (error || !surah) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="mb-6 text-sm">
            <ol className="flex items-center gap-2 text-gray-500">
              <li>
                <Link href="/browse" className="hover:text-gray-700">
                  Browse
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-900 font-medium">Surah {surahId}</li>
            </ol>
          </nav>
          <Alert variant="warning" title="Data Not Available">
            {error || 'This surah data is not available yet. We are working on adding all 114 surahs.'}
          </Alert>
          <div className="mt-6">
            <Link href="/browse">
              <Button variant="outline">Back to Browse</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

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
            <li className="text-gray-900 font-medium">{surah.name}</li>
          </ol>
        </nav>

        {/* Surah Header */}
        <div className="bg-gradient-hero pattern-overlay text-white rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-primary-200 text-sm">Surah {surah.id}</span>
                <span className={cn(
                  'text-xs px-2 py-1 rounded-full',
                  surah.revelationType === 'Meccan' ? 'bg-amber-500/20 text-amber-200' : 'bg-blue-500/20 text-blue-200'
                )}>
                  {surah.revelationType}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-1">{surah.name}</h1>
              <p className="text-primary-100">{surah.meaning}</p>
            </div>
            <div className="text-right">
              <p className="font-arabic text-4xl mb-2" dir="rtl">
                {surah.nameArabic}
              </p>
              <p className="text-primary-200 text-sm">{surah.verseCount} verses</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Link href={`/practice?verseId=${surah.id}:1`} className="flex-1">
            <Button className="w-full" size="lg">
              Start from Verse 1
            </Button>
          </Link>
        </div>

        {/* Verses List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Verses
            <span className="text-gray-500 font-normal ml-2">({surah.verses.length})</span>
          </h2>

          {surah.verses.map((verse, index) => (
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
                    {index + 1} of {surah.verses.length}
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
