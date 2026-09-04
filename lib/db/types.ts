export type DatabaseProvider = 'sqlite' | 'supabase'

export interface DatabaseStatus {
  activeProvider: DatabaseProvider
  defaultProvider: DatabaseProvider
  isOverridden: boolean
  isSupabaseConfigured: boolean
  latencyMs?: number
  error?: string
}

export interface ConnectionTestResult {
  ok: boolean
  latencyMs?: number
  error?: string
}

export interface SyncSummary {
  direction: 'push' | 'pull'
  tilesCount: number
  detailedItemsCount: number
  timestamp: string
}

export interface SyncResult {
  success: boolean
  summary?: SyncSummary
  error?: string
}

export interface SyncStatus {
  lastSyncTimestamp: string | null
  lastSyncDirection: 'push' | 'pull' | null
}

