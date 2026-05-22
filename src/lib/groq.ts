import Groq from 'groq-sdk'

export const MODEL_MAP = {
  roast:       'llama-3.3-70b-versatile',
  fix:         'qwen/qwen3-32b',
  explain:     'llama-3.1-8b-instant',
  security:    'llama-3.3-70b-versatile',
  performance: 'qwen-qwq-32b',
  refactor:    'qwen/qwen3-32b',
  score:       'llama-3.3-70b-versatile',
} as const

export type ModelMode = keyof typeof MODEL_MAP

export function getGroqClient() {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  })
}
