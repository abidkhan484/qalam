/**
 * Upload data files to R2 (smart sync)
 * Run with: npm run upload:r2
 *
 * Algorithm:
 * 1. List existing files in R2 via Worker /list-bucket endpoint
 * 2. Compare with local files
 * 3. Upload only missing files using wrangler
 *
 * Prerequisites:
 * - Worker must be deployed with /list-bucket endpoint
 * - wrangler must be authenticated
 */
import { execSync } from 'child_process'
import { readdirSync, existsSync } from 'fs'
import { join } from 'path'

const BUCKET = 'qalam-data'
const DATA_DIR = 'public/data'

// Worker API URL - use local for dev, production for deployed
const WORKER_URL = process.env.WORKER_URL || 'https://qalam-api.foyzul.workers.dev'

interface ListBucketResponse {
  success: boolean
  data: {
    objects: string[]
    truncated: boolean
    cursor: string | null
  }
}

/**
 * List all objects in R2 bucket via Worker API
 */
async function listR2Objects(): Promise<Set<string>> {
  console.log('Fetching existing files from R2 via Worker...')
  const objects = new Set<string>()

  let cursor: string | null = null

  do {
    const url = new URL(`${WORKER_URL}/list-bucket`)
    if (cursor) url.searchParams.set('cursor', cursor)

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`Failed to list bucket: ${response.status} ${response.statusText}`)
    }

    const result: ListBucketResponse = await response.json()
    if (!result.success) {
      throw new Error('Worker returned unsuccessful response')
    }

    for (const key of result.data.objects) {
      objects.add(key)
    }

    cursor = result.data.truncated ? result.data.cursor : null
  } while (cursor)

  return objects
}

/**
 * Upload a file to R2 using wrangler
 */
function uploadFile(localPath: string, remotePath: string): boolean {
  try {
    execSync(
      `npx wrangler r2 object put "${BUCKET}/${remotePath}" --file="${localPath}" --remote`,
      { stdio: 'pipe' }
    )
    return true
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`✗ Failed: ${message}`)
    return false
  }
}

async function main() {
  console.log('='.repeat(50))
  console.log('Qalam Data Sync to R2')
  console.log('='.repeat(50))
  console.log()

  // Step 1: List what's already in R2
  let existingInR2: Set<string>
  try {
    existingInR2 = await listR2Objects()
    console.log(`Found ${existingInR2.size} files already in R2\n`)
  } catch (error) {
    console.error('Failed to list R2 bucket:', error)
    console.error('\nMake sure the Worker is deployed with /list-bucket endpoint.')
    console.error('Run: npm run worker:deploy')
    process.exit(1)
  }

  // Step 2: Collect local files
  const filesToProcess: { localPath: string; remotePath: string }[] = []

  // Main data files
  for (const file of ['quran.json', 'surahs.json']) {
    const localPath = join(DATA_DIR, file)
    if (existsSync(localPath)) {
      filesToProcess.push({ localPath, remotePath: file })
    }
  }

  // Analysis files
  const analysisDir = join(DATA_DIR, 'analysis')
  if (existsSync(analysisDir)) {
    const analysisFiles = readdirSync(analysisDir)
      .filter(f => f.endsWith('.json') && !f.startsWith('_') && !f.startsWith('.'))

    for (const file of analysisFiles) {
      filesToProcess.push({
        localPath: join(analysisDir, file),
        remotePath: `analysis/${file}`,
      })
    }
  }

  console.log(`Found ${filesToProcess.length} local files\n`)

  // Step 3: Upload missing files
  let uploaded = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < filesToProcess.length; i++) {
    const { localPath, remotePath } = filesToProcess[i]
    const progress = `[${i + 1}/${filesToProcess.length}]`

    // Skip if already in R2
    if (existingInR2.has(remotePath)) {
      skipped++
      continue
    }

    console.log(`${progress} Uploading ${remotePath}...`)

    if (uploadFile(localPath, remotePath)) {
      uploaded++
      console.log(`✓ Done`)
    } else {
      failed++
    }
  }

  console.log()
  console.log('='.repeat(50))
  console.log('Summary')
  console.log('='.repeat(50))
  console.log(`  Uploaded: ${uploaded}`)
  console.log(`  Skipped:  ${skipped} (already in R2)`)
  console.log(`  Failed:   ${failed}`)
  console.log(`  Total in R2: ${existingInR2.size + uploaded}`)
  console.log('='.repeat(50))

  if (failed > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Upload failed:', error)
  process.exit(1)
})
