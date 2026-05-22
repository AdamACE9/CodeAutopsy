'use client'

import { motion } from 'framer-motion'

interface DiffViewProps {
  original: string
  modified: string
  label?: string
}

function diffLines(original: string, modified: string) {
  const origLines = original.split('\n')
  const modLines = modified.split('\n')
  const maxLen = Math.max(origLines.length, modLines.length)

  return Array.from({ length: maxLen }, (_, i) => ({
    left: origLines[i] ?? '',
    right: modLines[i] ?? '',
    changed: origLines[i] !== modLines[i],
    lineNum: i + 1,
  }))
}

export function DiffView({ original, modified, label = 'Fixed' }: DiffViewProps) {
  const lines = diffLines(original, modified)
  const changedCount = lines.filter(l => l.changed).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden border border-[#1e2d40]"
    >
      {/* Header */}
      <div className="flex bg-[#111827] border-b border-[#1e2d40]">
        <div className="flex-1 px-4 py-2.5 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="text-xs font-mono text-gray-400">Original</span>
        </div>
        <div className="w-px bg-[#1e2d40]" />
        <div className="flex-1 px-4 py-2.5 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="text-xs font-mono text-gray-400">{label}</span>
          {changedCount > 0 && (
            <span className="ml-auto text-xs font-mono text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
              {changedCount} changes
            </span>
          )}
        </div>
      </div>

      {/* Lines */}
      <div className="flex overflow-x-auto">
        {/* Original */}
        <div className="flex-1 min-w-0 border-r border-[#1e2d40]">
          {lines.map((line, i) => (
            <div
              key={i}
              className={`flex text-xs font-mono min-h-[22px] ${
                line.changed && line.left ? 'bg-red-500/[0.08] border-l-2 border-red-500' : ''
              }`}
            >
              <span className="w-10 text-right pr-3 text-gray-600 select-none border-r border-[#1e2d40] flex-shrink-0 py-0.5">
                {line.lineNum}
              </span>
              <span className={`px-3 py-0.5 whitespace-pre break-all ${line.changed && line.left ? 'text-red-300' : 'text-gray-300'}`}>
                {line.left}
              </span>
            </div>
          ))}
        </div>
        {/* Modified */}
        <div className="flex-1 min-w-0">
          {lines.map((line, i) => (
            <div
              key={i}
              className={`flex text-xs font-mono min-h-[22px] ${
                line.changed && line.right ? 'bg-green-500/[0.08] border-l-2 border-green-500' : ''
              }`}
            >
              <span className="w-10 text-right pr-3 text-gray-600 select-none border-r border-[#1e2d40] flex-shrink-0 py-0.5">
                {line.lineNum}
              </span>
              <span className={`px-3 py-0.5 whitespace-pre break-all ${line.changed && line.right ? 'text-green-300' : 'text-gray-300'}`}>
                {line.right}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
