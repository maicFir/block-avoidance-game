import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 服务端使用的 Supabase 客户端（具有服务角色权限）
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// 数据库类型定义
export interface User {
  id: string
  email: string
  name?: string
  image?: string
  created_at: string
  updated_at: string
  last_login?: string
  game_stats?: {
    high_score: number
    games_played: number
    total_time_played: number
  }
}

export interface GameSession {
  id: string
  user_id: string
  score: number
  duration: number
  created_at: string
  game_data?: any
}