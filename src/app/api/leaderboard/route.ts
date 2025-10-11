import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '../../../../lib/user-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // 获取排行榜数据
    const leaderboard = await UserService.getLeaderboard(Math.min(limit, 100)) // 最多100条

    return NextResponse.json({
      success: true,
      leaderboard
    })

  } catch (error) {
    console.error('获取排行榜失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}