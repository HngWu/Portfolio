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
          type: 'project' | 'experience' | 'award' | 'skill' | 'contact' | 'stat' | 'hero' | 'easter_egg' | 'cert' | 'education' | '3d' | 'terminal'
          size: string
          col_start: number | null
          row_start: number | null
          order_val: number
          is_hidden: boolean
          is_active: boolean
          content: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'project' | 'experience' | 'award' | 'skill' | 'contact' | 'stat' | 'hero' | 'easter_egg' | 'cert' | 'education' | '3d' | 'terminal'
          size: string
          col_start?: number | null
          row_start?: number | null
          order_val?: number
          is_hidden?: boolean
          is_active?: boolean
          content?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'project' | 'experience' | 'award' | 'skill' | 'contact' | 'stat' | 'hero' | 'easter_egg' | 'cert' | 'education' | '3d' | 'terminal'
          size?: string
          col_start?: number | null
          row_start?: number | null
          order_val?: number
          is_hidden?: boolean
          is_active?: boolean
          content?: Json
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          tile_id: string
          name: string
          description: string
          tech_stack: string[]
          github_url: string | null
          live_url: string | null
          featured: boolean
          deep_dive: Json | null
          order_val: number
        }
        Insert: {
          id?: string
          tile_id: string
          name: string
          description: string
          tech_stack?: string[]
          github_url?: string | null
          live_url?: string | null
          featured?: boolean
          deep_dive?: Json | null
          order_val?: number
        }
        Update: {
          id?: string
          tile_id?: string
          name?: string
          description?: string
          tech_stack?: string[]
          github_url?: string | null
          live_url?: string | null
          featured?: boolean
          deep_dive?: Json | null
          order_val?: number
        }
      }
      site_config: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
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