'use client'

import { motion } from 'framer-motion'
import type { ScoreResult } from '@/types'

const GRADE_COLORS: Record<string, string> = {
  A: 'text-green-400',
  B: 'text-teal-400',
  C: 'text-amber-400',
  D: 'text-orange-400',
  F: 'text-red-500',
}

const GRADE_BAR_COLORS: Record<string, string> = {
  A: 'bg-green-400',
  B: 'bg-teal-400',
  C: 'bg-amber-400',
  D: 'bg-orange-400',
  F: 'bg-red-500',
}

const GRADE_VALUES: Record<string, number> = {
  A: 95, B: 80, C: 65, D: 50, F: 30,
}

const OVERALL_BG: Record<string, string> = {
  A: 'bg-green-400/10 border-green-400/30',
  B: 'bg-teal-400/10 border-teal-400/30',
  C: 'bg-amber-400/10 border-amber-400/30',
  D: 'bg-orange-400/10 border-orange-400/30',
  F: 'bg-red-500/10 border-red-500/30',
}

interface ScoreCardProps {
  score: ScoreResult
}

export function ScoreCard({ score }: ScoreCardProps) {
  return (
    <div className="space-y-6">
      {/* Overall grade */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`flex items-center gap-4 p-5 rounded-xl border ${OVERALL_BG[score.overall]}`}
      >
        <div className={`text-7xl font-bold font-mono ${GRADE_COLORS[score.overall]}`}>
          {score.overall}
        </div>
        <div>
          <div className="text-sm text-gray-400 uppercase tracking-widest font-mono mb-1">Overall Grade</div>
          <p className="text-gray-200 text-sm leading-relaxed">{score.summary}</p>
        </div>
      </motion.div>

      {/* Axes */}
      <div className="space-y-3">
        {score.axes.map((axis, i) => (
          <motion.div
            key={axis.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.07 }}
            className="bg-[#1a2236] rounded-xl p-4 border border-[#1e2d40]"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-white font-semibold">{axis.name}</span>
                <p className="text-gray-400 text-xs mt-0.5">{axis.reason}</p>
              </div>
              <span className={`text-2xl font-bold font-mono ${GRADE_COLORS[axis.grade]}`}>
                {axis.grade}
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-[#0a0e1a] rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${GRADE_BAR_COLORS[axis.grade]}`}
                initial={{ width: 0 }}
                animate={{ width: `${GRADE_VALUES[axis.grade]}%` }}
                transition={{ duration: 0.6, delay: i * 0.07 + 0.2, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
