import { supabase, supabaseAdmin } from './supabase'

export interface UserGameStats {
  id: string
  user_id: string
  high_score: number
  games_played: number
  total_time_played: number
  last_played?: string
  created_at: string
  updated_at: string
}

export interface GameSession {
  id: string
  user_id: string
  score: number
  duration: number
  level_reached?: number
  coins_collected?: number
  obstacles_avoided?: number
  game_data?: any
  created_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  sound_enabled: boolean
  music_enabled: boolean
  difficulty_level: string
  theme: string
  language: string
  created_at: string
  updated_at: string
}

export class UserService {
  /**
   * 获取用户游戏统计数据
   */
  static async getUserGameStats(userId: string): Promise<UserGameStats | null> {
    const { data, error } = await supabase
      .from('user_game_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('获取用户游戏统计失败:', error)
      return null
    }

    return data
  }

  /**
   * 创建或更新用户游戏统计
   */
  static async upsertUserGameStats(userId: string, stats: Partial<UserGameStats>): Promise<UserGameStats | null> {
    const { data, error } = await supabase
      .from('user_game_stats')
      .upsert({
        user_id: userId,
        ...stats,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('更新用户游戏统计失败:', error)
      return null
    }

    return data
  }

  /**
   * 记录游戏会话
   */
  static async recordGameSession(userId: string, sessionData: Omit<GameSession, 'id' | 'user_id' | 'created_at'>): Promise<GameSession | null> {
    const { data, error } = await supabase
      .from('game_sessions')
      .insert({
        user_id: userId,
        ...sessionData
      })
      .select()
      .single()

    if (error) {
      console.error('记录游戏会话失败:', error)
      return null
    }

    // 同时更新用户统计
    await this.updateStatsAfterGame(userId, sessionData.score, sessionData.duration)

    return data
  }

  /**
   * 游戏结束后更新统计数据
   */
  static async updateStatsAfterGame(userId: string, score: number, duration: number): Promise<void> {
    const currentStats = await this.getUserGameStats(userId)
    
    const newStats = {
      high_score: Math.max(currentStats?.high_score || 0, score),
      games_played: (currentStats?.games_played || 0) + 1,
      total_time_played: (currentStats?.total_time_played || 0) + duration,
      last_played: new Date().toISOString()
    }

    await this.upsertUserGameStats(userId, newStats)
  }

  /**
   * 获取用户游戏历史
   */
  static async getUserGameHistory(userId: string, limit: number = 10): Promise<GameSession[]> {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('获取用户游戏历史失败:', error)
      return []
    }

    return data || []
  }

  /**
   * 获取排行榜
   */
  static async getLeaderboard(limit: number = 10): Promise<Array<UserGameStats & { user: { name: string; image?: string } }>> {
    const { data, error } = await supabase
      .from('user_game_stats')
      .select(`
        *,
        user:users(name, image)
      `)
      .order('high_score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('获取排行榜失败:', error)
      return []
    }

    return data || []
  }

  /**
   * 获取用户偏好设置
   */
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('获取用户偏好失败:', error)
      return null
    }

    return data
  }

  /**
   * 更新用户偏好设置
   */
  static async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('更新用户偏好失败:', error)
      return null
    }

    return data
  }

  /**
   * 初始化新用户数据
   */
  static async initializeNewUser(userId: string): Promise<void> {
    try {
      // 创建初始游戏统计
      await this.upsertUserGameStats(userId, {
        high_score: 0,
        games_played: 0,
        total_time_played: 0
      })

      // 创建默认偏好设置
      await this.updateUserPreferences(userId, {
        sound_enabled: true,
        music_enabled: true,
        difficulty_level: 'normal',
        theme: 'default',
        language: 'zh-CN'
      })

      console.log('新用户数据初始化成功:', userId)
    } catch (error) {
      console.error('初始化新用户数据失败:', error)
    }
  }
}