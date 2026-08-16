import type { Database } from './supabase'

export type DetailedItemRow = Database['public']['Tables']['detailed_items']['Row']
export type DetailedItemInsert = Database['public']['Tables']['detailed_items']['Insert']
export type DetailedItemUpdate = Database['public']['Tables']['detailed_items']['Update']

export type TileRow = Database['public']['Tables']['tiles']['Row']
export type TileInsert = Database['public']['Tables']['tiles']['Insert']
export type TileUpdate = Database['public']['Tables']['tiles']['Update']

export interface FormMetadataProps {
  type: string
  title: string
  subtitle?: string | null
  date_range?: string | null
  order_val?: number
}
