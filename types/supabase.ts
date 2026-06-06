export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tiles: {
        Row: {
          id: string
          type: string
          size: string
          col_start: number | null
          row_start: number | null
          order_val: number
          order_val_mobile: number
          is_hidden: boolean
          is_active: boolean
          content: Json
          deep_dive: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          size: string
          col_start?: number | null
          row_start?: number | null
          order_val?: number
          order_val_mobile?: number
          is_hidden?: boolean
          is_active?: boolean
          content?: Json
          deep_dive?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          size?: string
          col_start?: number | null
          row_start?: number | null
          order_val?: number
          order_val_mobile?: number
          is_hidden?: boolean
          is_active?: boolean
          content?: Json
          deep_dive?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
