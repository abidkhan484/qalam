'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input, Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Surah } from '@/types'

// Mock surah data - will be replaced with real data
const mockSurahs: Surah[] = [
  { id: 1, name: 'Al-Fatihah', nameArabic: 'الفاتحة', meaning: 'The Opening', verseCount: 7, revelationType: 'Meccan' },
  { id: 2, name: 'Al-Baqarah', nameArabic: 'البقرة', meaning: 'The Cow', verseCount: 286, revelationType: 'Medinan' },
  { id: 3, name: 'Ali \'Imran', nameArabic: 'آل عمران', meaning: 'The Family of Imran', verseCount: 200, revelationType: 'Medinan' },
  { id: 4, name: 'An-Nisa', nameArabic: 'النساء', meaning: 'The Women', verseCount: 176, revelationType: 'Medinan' },
  { id: 5, name: 'Al-Ma\'idah', nameArabic: 'المائدة', meaning: 'The Table Spread', verseCount: 120, revelationType: 'Medinan' },
  { id: 6, name: 'Al-An\'am', nameArabic: 'الأنعام', meaning: 'The Cattle', verseCount: 165, revelationType: 'Meccan' },
  { id: 7, name: 'Al-A\'raf', nameArabic: 'الأعراف', meaning: 'The Heights', verseCount: 206, revelationType: 'Meccan' },
  { id: 36, name: 'Ya-Sin', nameArabic: 'يس', meaning: 'Ya Sin', verseCount: 83, revelationType: 'Meccan' },
  { id: 55, name: 'Ar-Rahman', nameArabic: 'الرحمن', meaning: 'The Most Merciful', verseCount: 78, revelationType: 'Medinan' },
  { id: 67, name: 'Al-Mulk', nameArabic: 'الملك', meaning: 'The Sovereignty', verseCount: 30, revelationType: 'Meccan' },
  { id: 112, name: 'Al-Ikhlas', nameArabic: 'الإخلاص', meaning: 'The Sincerity', verseCount: 4, revelationType: 'Meccan' },
  { id: 113, name: 'Al-Falaq', nameArabic: 'الفلق', meaning: 'The Daybreak', verseCount: 5, revelationType: 'Meccan' },
  { id: 114, name: 'An-Nas', nameArabic: 'الناس', meaning: 'Mankind', verseCount: 6, revelationType: 'Meccan' },
]

type FilterType = 'all' | 'Meccan' | 'Medinan'

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

  const filteredSurahs = mockSurahs.filter((surah) => {
    const matchesSearch =
      surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.nameArabic.includes(searchQuery) ||
      surah.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.id.toString() === searchQuery

    const matchesFilter = filter === 'all' || surah.revelationType === filter

    return matchesSearch && matchesFilter
  })

  return (
    <div className="container-wide py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Surahs</h1>
        <p className="text-gray-600 mt-1">
          Select a surah to practice translating its verses
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name, number, or meaning..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'Meccan', 'Medinan'] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === type
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {type === 'all' ? 'All' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Surah Grid */}
      {filteredSurahs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No surahs found matching your search.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurahs.map((surah) => (
            <Link key={surah.id} href={`/browse/surah/${surah.id}`}>
              <Card hover className="h-full">
                <div className="flex items-start gap-4">
                  {/* Surah Number */}
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 font-bold">{surah.id}</span>
                  </div>

                  {/* Surah Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{surah.name}</h3>
                        <p className="text-sm text-gray-500">{surah.meaning}</p>
                      </div>
                      <p className="font-arabic text-xl text-gray-700 flex-shrink-0" dir="rtl">
                        {surah.nameArabic}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      <span>{surah.verseCount} verses</span>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full',
                        surah.revelationType === 'Meccan' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      )}>
                        {surah.revelationType}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        Showing {filteredSurahs.length} of {mockSurahs.length} surahs
      </div>
    </div>
  )
}
