import Groq from 'groq-sdk'

export async function detectLanguage(code: string, groq: Groq): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: 'You are a programming language detector. Respond with ONLY the language name in lowercase (e.g., "javascript", "python", "typescript", "go", "java", "rust", "cpp", "c", "ruby", "php", "swift", "kotlin"). No explanation, just the language name.',
      },
      {
        role: 'user',
        content: `What programming language is this?\n\n${code.slice(0, 500)}`,
      },
    ],
    max_tokens: 10,
    temperature: 0,
  })

  const detected = completion.choices[0]?.message?.content?.trim().toLowerCase() || 'unknown'
  return detected
}
