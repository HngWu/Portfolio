import React from 'react'

export type ViewMode = 'quick' | 'deep'

export interface BentoTileBaseProps {
  id: string
  size: string
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
  className?: string
  children?: React.ReactNode
}

export interface TerminalProjectItem {
  name: string
  slug: string
  description: string
  notes?: string
}
