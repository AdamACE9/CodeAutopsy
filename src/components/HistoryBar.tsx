'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import type { HistoryEntry } from '@/types'

interface HistoryBarProps {
  onRestore: (entry: HistoryEntry) => void
  currentEntry?: Omit<HistoryEntry, 'id' | 'timestamp'>
}

const LANG_COLORS: Record<string, string> = {
  javascript: 'bg-yellow-500/20 text-yellow-300',
  typescript: 'bg-blue-500/20 text-blue-300',
  python: 'bg-green-500/20 text-green-300',
  go: 'bg-cyan-500/20 text-cyan-300',
  java: 'bg-orange-500/20 text-orange-300',
  rust: 'bg-orange-600/20 text-orange-400',
  default: 'bg-purple-500/20 text-purple-300',
}

function getLangColor(lang: string) {
  return LANG_COLORS[lang] || LANG_COLORS.default
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

export function HistoryBar({ onRestore, currentEntry }: HistoryBarProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('codeautopsy-history')
    if (saved) {
      try { setHistory(JSON.parse(saved)) } catch {}
    }
  }, [])

  const saveEntry = (entry: HistoryEntry) => {
    setHistory(prev => {
      const updated = [entry, ...prev.filter(e => e.id !== entry.id)].slice(0, 5)
      localStorage.setItem('codeautopsy-history', JSON.stringify(updated))
      return updated
    })
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('codeautopsy-history')
  }

  // Expose saveEntry via a custom event
  useEffect(() => {
    const handler = (e: Event) => saveEntry((e as CustomEvent).detail)
    window.addEventListener('save-history', handler)
    return () => window.removeEventListener('save-history', handler)
  }, [])

  if (history.length === 0) return null

  return (
    <div className="border-t border-[#1e2d40] bg-[#111827]">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-[#1a2236] transition-colors"
      >
        <Clock className="w-4 h-4 text-gray-500" />
        <span className="text-xs text-gray-400 font-mono">History ({history.length})</span>
        <div className="ml-auto flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); clearHistory() }}
              className="p-1 hover:text-red-400 text-gray-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {expanded
            ? <ChevronDown className="w-4 h-4 text-gray-500" />
            : <ChevronUp className="w-4 h-4 text-gray-500" />
          }
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 flex gap-2 overflow-x-auto">
              {history.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => onRestore(entry)}
                  className="flex-shrink-0 w-48 text-left p-3 bg-[#1a2236] rounded-lg border border-[#1e2d40] hover:border-[#6366f1]/50 transition-all hover:bg-[#1a2236]/80 group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${getLangColor(entry.language)}`}>
                      {entry.language}
                    </span>
                    {entry.overallScore && (
                      <span className="text-xs font-mono font-bold text-indigo-400 ml-auto">
                        {entry.overallScore}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-mono truncate mb-1">{entry.firstLine}</p>
                  <p className="text-xs text-gray-600">{timeAgo(entry.timestamp)}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
