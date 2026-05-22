'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CodeInput } from '@/components/CodeInput'
import { ResultsPanel } from '@/components/ResultsPanel'
import { HistoryBar } from '@/components/HistoryBar'
import type { AnalysisMode, TabResult, HistoryEntry } from '@/types'

const MODES: AnalysisMode[] = ['roast', 'fix', 'explain', 'security', 'performance', 'refactor', 'score']

function makeDefaultResults(): Record<AnalysisMode, TabResult> {
  return Object.fromEntries(
    MODES.map(mode => [mode, { mode, result: null, loading: false, error: null, model: null }])
  ) as Record<AnalysisMode, TabResult>
}

export default function HomePage() {
  const [code, setCode] = useState('')
  const [results, setResults] = useState<Record<AnalysisMode, TabResult>>(makeDefaultResults())
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null)
  const [isAnyLoading, setIsAnyLoading] = useState(false)

  const setTabResult = useCallback((mode: AnalysisMode, patch: Partial<TabResult>) => {
    setResults(prev => ({
      ...prev,
      [mode]: { ...prev[mode], ...patch },
    }))
  }, [])

  const runMode = useCallback(async (mode: AnalysisMode, codeOverride?: string) => {
    const targetCode = codeOverride ?? code
    if (!targetCode.trim()) return

    setTabResult(mode, { loading: true, error: null, result: null, model: null })

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: targetCode,
          mode,
          language: detectedLanguage ?? 'auto',
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Analysis failed')
      }

      const contentType = res.headers.get('content-type') || ''

      if (contentType.includes('text/event-stream')) {
        // Streaming response (fix/refactor)
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let fullResult = ''
        let modelName = null

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.done) {
                  fullResult = data.result
                  modelName = data.model
                  if (data.language) setDetectedLanguage(data.language)
                } else if (data.delta) {
                  fullResult += data.delta
                  setTabResult(mode, { result: fullResult, loading: true, model: data.model })
                }
              } catch {}
            }
          }
        }
        setTabResult(mode, { result: fullResult, loading: false, model: modelName })
      } else {
        const data = await res.json()
        if (data.language) setDetectedLanguage(data.language)
        setTabResult(mode, { result: data.result, loading: false, model: data.model })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setTabResult(mode, { loading: false, error: msg })
    }
  }, [code, detectedLanguage, setTabResult])

  const runAll = useCallback(async () => {
    if (!code.trim()) return
    setIsAnyLoading(true)

    // Reset all tabs to loading
    setResults(prev => {
      const next = { ...prev }
      MODES.forEach(m => { next[m] = { mode: m, result: null, loading: true, error: null, model: null } })
      return next
    })

    // Fire all in parallel
    await Promise.allSettled(MODES.map(mode => runMode(mode, code)))
    setIsAnyLoading(false)

    // Save to history
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      language: detectedLanguage ?? 'unknown',
      timestamp: Date.now(),
      firstLine: code.split('\n')[0]?.slice(0, 60) ?? '',
      results: {},
    }
    window.dispatchEvent(new CustomEvent('save-history', { detail: entry }))
  }, [code, detectedLanguage, runMode])

  const handleRestore = useCallback((entry: HistoryEntry) => {
    // Restore results from history entry
    setResults(prev => {
      const next = { ...prev }
      Object.entries(entry.results).forEach(([mode, result]) => {
        if (result) {
          next[mode as AnalysisMode] = {
            mode: mode as AnalysisMode,
            result,
            loading: false,
            error: null,
            model: null,
          }
        }
      })
      return next
    })
    if (entry.language !== 'unknown') setDetectedLanguage(entry.language)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-xs font-bold font-mono text-white">CA</span>
            </div>
            <span className="text-white font-bold font-sans text-base tracking-tight">CodeAutopsy</span>
          </motion.div>
          <div className="h-4 w-px bg-border" />
          <span className="text-xs text-gray-500 font-mono hidden sm:block">AI-powered code analysis</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-mono text-gray-600 hidden md:block">Powered by</span>
            <span className="text-xs font-mono px-2 py-1 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20">
              Groq
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center py-8 px-4"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 font-sans">
          Put your code on the table.
        </h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Roast it. Fix it. Scan it. Score it. AI-powered analysis across 7 dimensions, in seconds.
        </p>
      </motion.div>

      {/* Main content */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-3 sm:px-6 pb-6">
        <div className="flex flex-col md:flex-row gap-4 h-full" style={{ minHeight: '600px' }}>
          {/* Left panel — 40% */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="w-full md:w-[40%] flex flex-col"
            style={{ minHeight: '500px' }}
          >
            <CodeInput
              value={code}
              onChange={setCode}
              onRunMode={runMode}
              onRunAll={runAll}
              detectedLanguage={detectedLanguage}
              isLoading={isAnyLoading}
            />
          </motion.div>

          {/* Right panel — 60% */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full md:flex-1 flex flex-col"
            style={{ minHeight: '500px' }}
          >
            <ResultsPanel
              results={results}
              originalCode={code}
            />
          </motion.div>
        </div>
      </main>

      {/* History bar */}
      <HistoryBar onRestore={handleRestore} />
    </div>
  )
}
