/**
 * KV Cache Helper for Assessment Results
 */

import type { Env, AttemptFeedback } from '../types'

// Cache TTL: 30 days (in seconds)
const CACHE_TTL = 30 * 24 * 60 * 60

/**
 * Generate a cache key from verseId and user translation
 * Uses a simple hash to create a consistent key
 */
export function getCacheKey(verseId: string, userTranslation: string): string {
  // Normalize the translation: lowercase, trim, collapse whitespace
  const normalized = userTranslation.toLowerCase().trim().replace(/\s+/g, ' ')

  // Create a simple hash of the normalized translation
  let hash = 0
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }

  // Make hash positive and convert to hex
  const hashHex = (hash >>> 0).toString(16)

  return `assessment:${verseId}:${hashHex}`
}

/**
 * Get cached assessment from KV
 */
export async function getCachedAssessment(
  env: Env,
  verseId: string,
  userTranslation: string
): Promise<AttemptFeedback | null> {
  if (!env.ASSESSMENT_CACHE) {
    return null
  }

  const key = getCacheKey(verseId, userTranslation)

  try {
    const cached = await env.ASSESSMENT_CACHE.get(key, 'json')
    return cached as AttemptFeedback | null
  } catch (error) {
    console.error('Cache read error:', error)
    return null
  }
}

/**
 * Store assessment in KV cache
 */
export async function cacheAssessment(
  env: Env,
  verseId: string,
  userTranslation: string,
  feedback: AttemptFeedback
): Promise<void> {
  if (!env.ASSESSMENT_CACHE) {
    return
  }

  const key = getCacheKey(verseId, userTranslation)

  try {
    await env.ASSESSMENT_CACHE.put(key, JSON.stringify(feedback), {
      expirationTtl: CACHE_TTL,
    })
  } catch (error) {
    console.error('Cache write error:', error)
    // Don't throw - caching failure shouldn't break the request
  }
}
