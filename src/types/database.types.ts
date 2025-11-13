// TypeScript types for Supabase database
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
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          total_weekly_votes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          total_weekly_votes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          total_weekly_votes?: number
          created_at?: string
          updated_at?: string
        }
      }
      songs: {
        Row: {
          id: string
          user_id: string
          video_id: string
          title: string
          thumbnail: string
          channel_name: string | null
          category: string
          start_time: number
          is_active: boolean
          week_year: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          title: string
          thumbnail: string
          channel_name?: string | null
          category: string
          start_time?: number
          is_active?: boolean
          week_year: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          title?: string
          thumbnail?: string
          channel_name?: string | null
          category?: string
          start_time?: number
          is_active?: boolean
          week_year?: string
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          song_id: string
          voter_id: string
          week_year: string
          created_at: string
        }
        Insert: {
          id?: string
          song_id: string
          voter_id: string
          week_year: string
          created_at?: string
        }
        Update: {
          id?: string
          song_id?: string
          voter_id?: string
          week_year?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          song_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          song_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          song_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      song_changes: {
        Row: {
          id: string
          user_id: string
          old_song_id: string | null
          new_song_id: string | null
          change_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          old_song_id?: string | null
          new_song_id?: string | null
          change_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          old_song_id?: string | null
          new_song_id?: string | null
          change_date?: string
          created_at?: string
        }
      }
    }
  }
}
