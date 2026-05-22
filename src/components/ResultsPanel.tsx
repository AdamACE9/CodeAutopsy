'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TabContent } from './TabContent'
import type { AnalysisMode, TabResult } from '@/types'

const TABS: { mode: AnalysisMode; label: string; icon: string }[] = [
  { mode: 'roast', label: 'Roast', icon: '🔥' },
  { mode: 'fix', label: 'Fix', icon: '🔧' },
  { mode: 'explain', label: 'Explain', icon: '💡' },
  { mode: 'security', label: 'Security', icon: '🛡️' },
  { mode: 'performance', label: 'Performance', icon: '⚡' },
  { mode: 'refactor', label: 'Refactor', icon: '✨' },
  { mode: 'score', label: 'Score', icon: '📊' },
]

interface ResultsPanelProps {
  results: Record<AnalysisMode, TabResult>
  originalCode: string
  activeMode?: AnalysisMode
}

const SHORT_MODEL: Record<string, string> = {
  'llama-3.3-70b-versatile': 'llama-3.3-70b',
  'qwen/qwen3-32b': 'qwen3-32b',
  'llama-3.1-8b-instant': 'llama-3.1-8b',
  'openai/gpt-oss-120b': 'gpt-oss-120b',
  'qwen-qwq-32b': 'qwq-32b',
}

export function ResultsPanel({ results, originalCode, activeMode }: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<AnalysisMode>(activeMode ?? 'roast')

  const current = results[activeTab]
  const hasAnyResult = Object.values(results).some(r => r.result !== null)

  return (
    <div className="flex flex-col h-full bg-surface rounded-xl border border-border overflow-hidden">
      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-border bg-surface scrollbar-none">
        {TABS.map(({ mode, label, icon }) => {
          const tabResult = results[mode]
          const isActive = activeTab === mode
          const hasResult = tabResult.result !== null
          const isLoading = tabResult.loading

          return (
            <button
              key={mode}
              onClick={() => setActiveTab(mode)}
              className={`relative flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-xs font-semibold transition-all font-mono border-b-2 ${
                isActive
                  ? 'border-accent text-white bg-surface-2'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-surface-2/50'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
              {isLoading && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              )}
              {hasResult && !isLoading && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              )}
            </button>
          )
        })}
      </div>

      {/* Model badge */}
      {current.model && (
        <div className="px-4 py-2 border-b border-border bg-bg/30 flex items-center gap-2">
          <span className="text-xs text-gray-600 font-mono">model</span>
          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            {SHORT_MODEL[current.model] ?? current.model}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <TabContent
              mode={activeTab}
              result={current.result}
              loading={current.loading}
              error={current.error}
              originalCode={originalCode}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
