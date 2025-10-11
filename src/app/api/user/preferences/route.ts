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

    // 获取用户偏好设置
    const preferences = await UserService.getUserPreferences(session.user.id)

    return NextResponse.json({
      success: true,
      preferences
    })

  } catch (error) {
    console.error('获取用户偏好失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await request.json()
    const { sound_enabled, music_enabled, difficulty_level, theme, language } = body

    // 更新用户偏好设置
    const preferences = await UserService.updateUserPreferences(session.user.id, {
      sound_enabled,
      music_enabled,
      difficulty_level,
      theme,
      language
    })

    if (!preferences) {
      return NextResponse.json({ error: '更新偏好设置失败' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      preferences
    })

  } catch (error) {
    console.error('更新用户偏好失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}