'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Clipboard, X, Upload, Zap, Play, ChevronDown } from 'lucide-react'
import type { AnalysisMode } from '@/types'

const MODES: { mode: AnalysisMode; label: string; emoji: string }[] = [
  { mode: 'roast', label: 'Roast', emoji: '🔥' },
  { mode: 'fix', label: 'Fix', emoji: '🔧' },
  { mode: 'explain', label: 'Explain', emoji: '💡' },
  { mode: 'security', label: 'Security', emoji: '🛡️' },
  { mode: 'performance', label: 'Performance', emoji: '⚡' },
  { mode: 'refactor', label: 'Refactor', emoji: '✨' },
  { mode: 'score', label: 'Score', emoji: '📊' },
]

interface CodeInputProps {
  value: string
  onChange: (v: string) => void
  onRunMode: (mode: AnalysisMode) => void
  onRunAll: () => void
  detectedLanguage: string | null
  isLoading: boolean
}

export function CodeInput({ value, onChange, onRunMode, onRunAll, detectedLanguage, isLoading }: CodeInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showModes, setShowModes] = useState(false)

  const lineCount = value.split('\n').length
  const charCount = value.length

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      onChange(text)
    } catch {}
  }, [onChange])

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onChange(ev.target?.result as string)
    reader.readAsText(file)
    e.target.value = ''
  }, [onChange])

  const lineNumbers = Array.from({ length: Math.max(lineCount, 20) }, (_, i) => i + 1)

  return (
    <div className="flex flex-col h-full bg-[#111827] rounded-xl border border-[#1e2d40] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2d40] bg-[#111827]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <span className="text-sm font-mono text-gray-400 ml-2">input.code</span>
        {detectedLanguage && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ml-auto text-xs font-mono px-2 py-0.5 rounded bg-[#6366f1]/20 text-indigo-300 border border-[#6366f1]/30"
          >
            {detectedLanguage}
          </motion.span>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1e2d40]">
        <button
          onClick={handlePaste}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2 py-1.5 rounded hover:bg-[#1a2236] transition-all font-mono"
        >
          <Clipboard className="w-3.5 h-3.5" />
          Paste
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2 py-1.5 rounded hover:bg-[#1a2236] transition-all font-mono"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".js,.ts,.tsx,.jsx,.py,.go,.java,.rs,.cpp,.c,.rb,.php,.swift,.kt"
          onChange={handleFile}
          className="hidden"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 px-2 py-1.5 rounded hover:bg-red-500/10 transition-all font-mono"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
        <div className="ml-auto text-xs font-mono text-gray-600">
          {lineCount}L · {charCount}C
        </div>
      </div>

      {/* Code area with line numbers */}
      <div className="flex flex-1 overflow-hidden min-h-[300px]">
        {/* Line numbers */}
        <div className="select-none py-3 px-2 text-right bg-[#0a0e1a]/50 border-r border-[#1e2d40] min-w-[3rem]">
          {lineNumbers.map(n => (
            <div key={n} className="text-xs text-gray-600 font-mono leading-[1.6rem] h-[1.6rem]">
              {n}
            </div>
          ))}
        </div>
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          placeholder="// Paste your code here, or click Upload..."
          className="flex-1 bg-transparent text-gray-200 font-mono text-sm p-3 resize-none outline-none leading-[1.6rem] placeholder-gray-700 overflow-y-auto"
          style={{ tabSize: 2 }}
        />
      </div>

      {/* Run buttons */}
      <div className="p-3 border-t border-[#1e2d40] space-y-2">
        {/* Run All button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onRunAll}
          disabled={!value.trim() || isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#6366f1] hover:bg-[#4f52d9] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold text-sm text-white"
        >
          <Zap className="w-4 h-4" />
          {isLoading ? 'Analyzing...' : 'RUN ALL'}
        </motion.button>

        {/* Individual mode buttons */}
        <button
          onClick={() => setShowModes(v => !v)}
          className="w-full flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors font-mono py-1"
        >
          Run individual
          <ChevronDown className={`w-3 h-3 transition-transform ${showModes ? 'rotate-180' : ''}`} />
        </button>

        {showModes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-2 gap-1.5"
          >
            {MODES.map(({ mode, label, emoji }) => (
              <button
                key={mode}
                onClick={() => onRunMode(mode)}
                disabled={!value.trim() || isLoading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1a2236] hover:bg-[#1e2d40] border border-[#1e2d40] hover:border-[#6366f1]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-mono text-gray-300 hover:text-white"
              >
                <span>{emoji}</span>
                {label}
                <Play className="w-3 h-3 ml-auto text-gray-600" />
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
