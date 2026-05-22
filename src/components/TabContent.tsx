'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, AlertCircle } from 'lucide-react'
import { useState, useCallback } from 'react'
import { DiffView } from './DiffView'
import { SecurityPanel } from './SecurityCard'
import { ScoreCard } from './ScoreCard'
import type { AnalysisMode, SecurityFinding, PerformanceFinding, ScoreResult } from '@/types'

interface TabContentProps {
  mode: AnalysisMode
  result: string | null
  loading: boolean
  error: string | null
  originalCode?: string
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs font-mono px-2 py-1.5 rounded bg-surface-2 hover:bg-border border border-border text-gray-400 hover:text-white transition-all"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function SkeletonText({ lines = 8, mode }: { lines?: number; mode: AnalysisMode }) {
  if (mode === 'score') {
    return (
      <div className="space-y-4">
        <div className="skeleton h-24 rounded-xl" />
        {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 rounded-xl" style={{ animationDelay: `${i*0.1}s` }} />)}
      </div>
    )
  }
  if (mode === 'security' || mode === 'performance') {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-xl" style={{ animationDelay: `${i*0.1}s` }} />)}
      </div>
    )
  }
  if (mode === 'fix' || mode === 'refactor') {
    return (
      <div className="skeleton h-64 rounded-xl" />
    )
  }
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="skeleton h-4 rounded"
          style={{ width: `${Math.random() * 40 + 60}%`, animationDelay: `${i * 0.05}s` }}
        />
      ))}
    </div>
  )
}

function PerformancePanel({ findings }: { findings: PerformanceFinding[] }) {
  if (findings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4">
          <span className="text-2xl">⚡</span>
        </div>
        <h3 className="text-green-400 font-semibold text-lg mb-1">No performance issues found</h3>
        <p className="text-gray-500 text-sm">This code looks efficient.</p>
      </div>
    )
  }

  const SEVERITY_COLORS = {
    CRITICAL: 'bg-red-500/10 border-red-500/30 text-red-400',
    HIGH: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    MEDIUM: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    LOW: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  }

  return (
    <div className="space-y-3">
      {findings.map((f, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className={`rounded-xl border p-4 ${SEVERITY_COLORS[f.severity]}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${SEVERITY_COLORS[f.severity]}`}>
              {f.severity}
            </span>
            <code className="text-sm font-mono text-white">{f.function}</code>
            <span className="ml-auto text-xs font-mono bg-black/30 px-2 py-0.5 rounded text-gray-300">{f.complexity}</span>
          </div>
          <p className="text-sm text-gray-300 mb-2">{f.issue}</p>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-xs text-green-400 font-mono font-bold mb-1">FIX</div>
            <p className="text-sm text-gray-200 font-mono whitespace-pre-wrap">{f.fix}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function MarkdownContent({ content }: { content: string }) {
  // Simple markdown rendering for roast/explain
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-white font-bold text-base mt-5 mb-2 first:mt-0 font-sans">{line.slice(3)}</h2>
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-gray-200 font-semibold text-sm mt-4 mb-1.5 font-sans">{line.slice(4)}</h3>
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <div key={i} className="flex gap-2 text-sm text-gray-300 my-0.5"><span className="text-accent mt-0.5">•</span><span>{line.slice(2)}</span></div>
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="text-white font-semibold text-sm my-1">{line.slice(2, -2)}</p>
        }
        if (line.trim() === '') return <div key={i} className="h-2" />
        return <p key={i} className="text-gray-300 text-sm leading-relaxed my-0.5">{line}</p>
      })}
    </div>
  )
}

export function TabContent({ mode, result, loading, error, originalCode = '' }: TabContentProps) {
  if (loading) {
    return (
      <div className="p-5">
        <SkeletonText mode={mode} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-5 flex items-start gap-3 bg-red-500/5 border border-red-500/20 rounded-xl m-4">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-300 font-semibold text-sm mb-1">Analysis failed</p>
          <p className="text-red-400/70 text-xs font-mono">{error}</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center px-6">
        <p className="text-gray-600 text-sm font-mono">Run analysis to see results</p>
      </div>
    )
  }

  // Security
  if (mode === 'security') {
    let findings: SecurityFinding[] = []
    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      findings = JSON.parse(cleaned)
    } catch {
      findings = []
    }
    return (
      <div className="p-4">
        <div className="flex justify-end mb-3"><CopyButton text={result} /></div>
        <SecurityPanel findings={findings} />
      </div>
    )
  }

  // Performance
  if (mode === 'performance') {
    let findings: PerformanceFinding[] = []
    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      findings = JSON.parse(cleaned)
    } catch {
      findings = []
    }
    return (
      <div className="p-4">
        <div className="flex justify-end mb-3"><CopyButton text={result} /></div>
        <PerformancePanel findings={findings} />
      </div>
    )
  }

  // Score
  if (mode === 'score') {
    let scoreData: ScoreResult | null = null
    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      scoreData = JSON.parse(cleaned)
    } catch {
      scoreData = null
    }
    if (!scoreData) {
      return (
        <div className="p-4">
          <div className="flex justify-end mb-3"><CopyButton text={result} /></div>
          <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap">{result}</pre>
        </div>
      )
    }
    return (
      <div className="p-4">
        <div className="flex justify-end mb-3"><CopyButton text={result} /></div>
        <ScoreCard score={scoreData} />
      </div>
    )
  }

  // Fix / Refactor — diff view
  if (mode === 'fix' || mode === 'refactor') {
    const cleaned = result.replace(/```[\w]*\n?/g, '').replace(/```\n?/g, '').trim()
    return (
      <div className="p-4">
        <div className="flex justify-end mb-3"><CopyButton text={cleaned} /></div>
        <DiffView
          original={originalCode}
          modified={cleaned}
          label={mode === 'fix' ? 'Fixed' : 'Refactored'}
        />
      </div>
    )
  }

  // Roast / Explain — markdown
  return (
    <div className="p-5">
      <div className="flex justify-end mb-3"><CopyButton text={result} /></div>
      <MarkdownContent content={result} />
    </div>
  )
}
