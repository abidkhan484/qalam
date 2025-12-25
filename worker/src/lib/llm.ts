/**
 * LLM Provider Implementations for Cloudflare Worker
 */

import type { Env, AssessmentResult } from '../types'

/**
 * Parse JSON from LLM response, handling markdown code blocks
 */
function parseJsonResponse(content: string): AssessmentResult {
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

/**
 * Together.ai Provider
 */
async function callTogether(prompt: string, env: Env): Promise<AssessmentResult> {
  const apiKey = env.TOGETHER_API_KEY
  const model = env.TOGETHER_MODEL || 'meta-llama/Llama-3.3-70B-Instruct-Turbo'

  if (!apiKey) {
    throw new Error('TOGETHER_API_KEY is not configured')
  }

  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
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

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('Empty response from Together.ai')
  }

  return parseJsonResponse(content)
}

/**
 * vLLM Provider (OpenAI-compatible)
 */
async function callVLLM(prompt: string, env: Env): Promise<AssessmentResult> {
  const baseUrl = env.VLLM_BASE_URL || 'http://localhost:8000'
  const model = env.VLLM_MODEL || 'Qwen/Qwen3-4B-Instruct'

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    const errorText = await response.text()
    throw new Error(`vLLM API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('Empty response from vLLM')
  }

  return parseJsonResponse(content)
}

/**
 * Ollama Provider
 */
async function callOllama(prompt: string, env: Env): Promise<AssessmentResult> {
  const baseUrl = env.OLLAMA_BASE_URL || 'http://localhost:11434'
  const model = env.OLLAMA_MODEL || 'qwen3:4b'

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Ollama API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json() as { response?: string }
  if (!data.response) {
    throw new Error('Ollama returned empty response')
  }

  return parseJsonResponse(data.response)
}

/**
 * Unified LLM caller - selects provider based on env
 */
export async function callLLM(prompt: string, env: Env): Promise<AssessmentResult> {
  const backend = (env.ASSESSMENT_BACKEND || 'together').toLowerCase()

  switch (backend) {
    case 'vllm':
      return callVLLM(prompt, env)
    case 'ollama':
      return callOllama(prompt, env)
    case 'together':
    default:
      return callTogether(prompt, env)
  }
}
