import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../../auth'
import { UserService } from '../../../../../lib/user-service'

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 获取用户游戏统计
    const stats = await UserService.getUserGameStats(session.user.id)
    
    // 获取用户游戏历史
    const history = await UserService.getUserGameHistory(session.user.id, 10)

    // 获取用户偏好设置
    const preferences = await UserService.getUserPreferences(session.user.id)

    return NextResponse.json({
      success: true,
      stats,
      history,
      preferences
    })

  } catch (error) {
    console.error('获取用户统计失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}