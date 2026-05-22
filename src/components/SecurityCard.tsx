'use client'

import { motion } from 'framer-motion'
import { ShieldAlert, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import type { SecurityFinding } from '@/types'

const SEVERITY_CONFIG = {
  CRITICAL: {
    bg: 'bg-red-500/10 border-red-500/30',
    badge: 'bg-red-500 text-white',
    icon: ShieldAlert,
    iconColor: 'text-red-400',
  },
  HIGH: {
    bg: 'bg-orange-500/10 border-orange-500/30',
    badge: 'bg-orange-500 text-white',
    icon: AlertTriangle,
    iconColor: 'text-orange-400',
  },
  MEDIUM: {
    bg: 'bg-amber-500/10 border-amber-500/30',
    badge: 'bg-amber-500 text-black',
    icon: AlertCircle,
    iconColor: 'text-amber-400',
  },
  LOW: {
    bg: 'bg-blue-500/10 border-blue-500/30',
    badge: 'bg-blue-500 text-white',
    icon: Info,
    iconColor: 'text-blue-400',
  },
}

export function SecurityCard({ finding, index }: { finding: SecurityFinding; index: number }) {
  const config = SEVERITY_CONFIG[finding.severity]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={`rounded-xl border p-5 ${config.bg}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${config.badge}`}>
              {finding.severity}
            </span>
            <h3 className="text-white font-semibold text-sm">{finding.title}</h3>
          </div>
          <p className="text-gray-300 text-sm mb-3 leading-relaxed">{finding.description}</p>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-xs text-green-400 font-mono font-bold mb-1">FIX</div>
            <p className="text-gray-200 text-sm font-mono leading-relaxed whitespace-pre-wrap">{finding.fix}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function SecurityPanel({ findings }: { findings: SecurityFinding[] }) {
  if (findings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-green-400 font-semibold text-lg mb-1">No vulnerabilities found</h3>
        <p className="text-gray-500 text-sm">This code looks clean from a security perspective.</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-gray-400 text-sm">{findings.length} finding{findings.length !== 1 ? 's' : ''}</span>
        <div className="flex gap-1.5">
          {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(sev => {
            const count = findings.filter(f => f.severity === sev).length
            if (!count) return null
            return (
              <span key={sev} className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${SEVERITY_CONFIG[sev].badge}`}>
                {count} {sev}
              </span>
            )
          })}
        </div>
      </div>
      {findings.map((f, i) => (
        <SecurityCard key={i} finding={f} index={i} />
      ))}
    </div>
  )
}
