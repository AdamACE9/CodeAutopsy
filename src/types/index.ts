export type AnalysisMode =
  | 'roast'
  | 'fix'
  | 'explain'
  | 'security'
  | 'performance'
  | 'refactor'
  | 'score'

export interface AnalyzeRequest {
  code: string
  mode: AnalysisMode
  language: string
}

export interface AnalyzeResponse {
  result: string
  model: string
  language: string
}

export interface SecurityFinding {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  fix: string
}

export interface PerformanceFinding {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  function: string
  issue: string
  complexity: string
  fix: string
}

export interface ScoreAxis {
  name: string
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  reason: string
}

export interface ScoreResult {
  axes: ScoreAxis[]
  overall: 'A' | 'B' | 'C' | 'D' | 'F'
  summary: string
}

export interface HistoryEntry {
  id: string
  language: string
  timestamp: number
  overallScore?: string
  firstLine: string
  results: Partial<Record<AnalysisMode, string>>
}

export interface TabResult {
  mode: AnalysisMode
  result: string | null
  loading: boolean
  error: string | null
  model: string | null
}
