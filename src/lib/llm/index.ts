/**
 * Unified LLM Interface
 * Selects provider based on ASSESSMENT_BACKEND environment variable
 */

import { callTogether, callVLLM, callOllama, callLMStudio, type AssessmentResult } from './providers'
export { buildAssessmentPrompt } from './prompts'
export type { AssessmentResult }

/**
 * Supported LLM backends for translation assessment
 */
export type LLMBackend = 'together' | 'vllm' | 'ollama' | 'lms'

/**
 * Get the configured backend from environment
 */
export function getBackend(): LLMBackend {
  const backend = process.env.ASSESSMENT_BACKEND || 'together'
  return backend.toLowerCase() as LLMBackend
}

/**
 * Call the configured LLM backend
 */
export async function callLLM(prompt: string): Promise<AssessmentResult> {
  const backend = getBackend()

  switch (backend) {
    case 'vllm':
      return callVLLM(prompt)
    case 'ollama':
      return callOllama(prompt)
    case 'lms':
    case 'lmstudio' as LLMBackend:
      return callLMStudio(prompt)
    case 'together':
    default:
      return callTogether(prompt)
  }
}

/**
 * Get current backend configuration for logging/debugging
 */
export function getBackendConfig(): { backend: string; endpoint: string; model: string } {
  const backend = getBackend()

  switch (backend) {
    case 'vllm':
      return {
        backend: 'vLLM',
        endpoint: process.env.VLLM_BASE_URL || 'http://localhost:8000',
        model: process.env.VLLM_MODEL || 'Qwen/Qwen3-4B-Instruct',
      }
    case 'ollama':
      return {
        backend: 'Ollama',
        endpoint: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        model: process.env.OLLAMA_MODEL || 'qwen3:4b',
      }
    case 'lms':
      return {
        backend: 'LM Studio',
        endpoint: process.env.LMS_BASE_URL || 'http://localhost:1234',
        model: process.env.LMS_MODEL || 'local-model',
      }
    case 'together':
    default:
      return {
        backend: 'Together.ai',
        endpoint: 'https://api.together.xyz',
        model: process.env.TOGETHER_MODEL || 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      }
  }
}
