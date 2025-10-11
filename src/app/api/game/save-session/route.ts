import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../../auth'
import { UserService } from '../../../../../lib/user-service'

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await request.json()
    const { score, duration, level_reached, coins_collected, obstacles_avoided, game_data } = body

    // 验证必需字段
    if (typeof score !== 'number' || typeof duration !== 'number') {
      return NextResponse.json({ error: '缺少必需的游戏数据' }, { status: 400 })
    }

    // 保存游戏会话
    const gameSession = await UserService.recordGameSession(session.user.id, {
      score,
      duration,
      level_reached: level_reached || 1,
      coins_collected: coins_collected || 0,
      obstacles_avoided: obstacles_avoided || 0,
      game_data: game_data || null
    })

    if (!gameSession) {
      return NextResponse.json({ error: '保存游戏数据失败' }, { status: 500 })
    }

    // 获取更新后的用户统计
    const updatedStats = await UserService.getUserGameStats(session.user.id)

    return NextResponse.json({
      success: true,
      session: gameSession,
      stats: updatedStats
    })

  } catch (error) {
    console.error('保存游戏会话失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}