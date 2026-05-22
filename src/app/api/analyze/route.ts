import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { MODEL_MAP } from '@/lib/groq'
import { SYSTEM_PROMPTS } from '@/lib/prompts'
import { detectLanguage } from '@/lib/detect'
import type { AnalysisMode } from '@/types'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, mode, language: rawLanguage } = body as {
      code: string
      mode: AnalysisMode
      language: string
    }

    if (!code || !mode) {
      return NextResponse.json({ error: 'Missing code or mode' }, { status: 400 })
    }

    const modelName = MODEL_MAP[mode]
    if (!modelName) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    // Auto-detect language if needed
    let language = rawLanguage
    if (!language || language === 'auto') {
      language = await detectLanguage(code, groq)
    }

    const systemPrompt = SYSTEM_PROMPTS[mode]
    const userMessage = `Language: ${language}\n\n${code}`

    // Streaming for fix and refactor
    if (mode === 'fix' || mode === 'refactor') {
      const stream = await groq.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        stream: true,
        max_tokens: 8192,
        temperature: mode === 'fix' ? 0.1 : 0.3,
      })

      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          let fullText = ''
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || ''
            fullText += delta
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta, model: modelName, language })}\n\n`))
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, result: fullText, model: modelName, language })}\n\n`))
          controller.close()
        },
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Regular completion for all other modes
    // Performance uses qwen3-32b reasoning mode — prefix /think activates chain-of-thought
    const perfUserMessage = mode === 'performance' ? `/think\n\n${userMessage}` : userMessage
    const completion = await groq.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: perfUserMessage },
      ],
      stream: false,
      max_tokens: mode === 'roast' ? 4096 : mode === 'score' ? 1024 : mode === 'security' || mode === 'performance' ? 8192 : 2048,
      temperature: mode === 'score' ? 0.2 : mode === 'security' ? 0.1 : mode === 'performance' ? 0.6 : 0.4,
    })

    const result = completion.choices[0]?.message?.content || ''

    return NextResponse.json({
      result,
      model: modelName,
      language,
    })
  } catch (error: unknown) {
    console.error('Analysis error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
