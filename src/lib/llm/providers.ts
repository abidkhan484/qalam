/**
 * LLM Provider Implementations
 * Each provider handles its own HTTP calls and response parsing
 */

export interface AssessmentResult {
  score: number
  feedback: string
  correctElements: string[]
  missedElements: string[]
}

/**
 * Parse JSON from LLM response, handling markdown code blocks
 */
function parseJsonResponse(content: string): AssessmentResult {
  // Clean up potential markdown code blocks
  const cleanedContent = content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  try {
    const parsed = JSON.parse(cleanedContent)

    return {
      score: Math.max(0, Math.min(100, parsed.score || 0)),
      feedback: parsed.feedback || 'Unable to generate feedback.',
      correctElements: Array.isArray(parsed.correctElements) ? parsed.correctElements : [],
      missedElements: Array.isArray(parsed.missedElements) ? parsed.missedElements : [],
    }
  } catch {
    console.error('Failed to parse LLM response:', content)
    throw new Error('Failed to parse assessment response')
  }
}

// =============================================================================
// Together.ai Provider
// =============================================================================

const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions'

export async function callTogether(prompt: string): Promise<AssessmentResult> {
  const apiKey = process.env.TOGETHER_API_KEY
  const model = process.env.TOGETHER_MODEL || 'meta-llama/Llama-3.3-70B-Instruct-Turbo'

  if (!apiKey) {
    throw new Error('TOGETHER_API_KEY is not configured')
  }

  const response = await fetch(TOGETHER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Together.ai API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('Empty response from Together.ai')
  }

  return parseJsonResponse(content)
}

// =============================================================================
// vLLM Provider (OpenAI-compatible API)
// =============================================================================

export async function callVLLM(prompt: string): Promise<AssessmentResult> {
  const baseUrl = process.env.VLLM_BASE_URL || 'http://localhost:8000'
  const model = process.env.VLLM_MODEL || 'Qwen/Qwen3-4B-Instruct'
  const url = `${baseUrl}/v1/chat/completions`

  // 2 minute timeout for local inference
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 2 * 60 * 1000)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert in translation assessment. Return only valid JSON, no additional text or markdown.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Could not read error body')
      throw new Error(`vLLM API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('Empty response from vLLM')
    }

    return parseJsonResponse(content)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('vLLM request timed out after 2 minutes')
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to vLLM at ${baseUrl}. Is it running?`)
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

// =============================================================================
// Ollama Provider
// =============================================================================

export async function callOllama(prompt: string): Promise<AssessmentResult> {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
  const model = process.env.OLLAMA_MODEL || 'qwen3:4b'
  const url = `${baseUrl}/api/generate`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Could not read error body')
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    if (!data.response) {
      throw new Error('Ollama returned empty response')
    }

    return parseJsonResponse(data.response)
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to Ollama at ${baseUrl}. Is it running?`)
    }
    throw error
  }
}

// =============================================================================
// LM Studio Provider (OpenAI-compatible API)
// =============================================================================

export async function callLMStudio(prompt: string): Promise<AssessmentResult> {
  const baseUrl = process.env.LMS_BASE_URL || 'http://localhost:1234'
  const model = process.env.LMS_MODEL || 'local-model'
  const url = `${baseUrl}/v1/chat/completions`

  // 2 minute timeout
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 2 * 60 * 1000)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert in translation assessment. Return only valid JSON, no additional text or markdown.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Could not read error body')
      throw new Error(`LM Studio API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('Empty response from LM Studio')
    }

    return parseJsonResponse(content)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('LM Studio request timed out after 2 minutes')
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to LM Studio at ${baseUrl}. Is it running?`)
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}
