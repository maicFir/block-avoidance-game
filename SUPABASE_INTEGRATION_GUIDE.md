# Supabase + Google 登录集成指南

## 🎯 概述

本项目已成功集成 Supabase 数据库和 Google OAuth 登录，实现用户数据存储和管理功能。

## 📋 已完成的集成

### 1. 依赖安装
- ✅ `@supabase/supabase-js` - Supabase JavaScript 客户端
- ✅ `@auth/supabase-adapter` - NextAuth Supabase 适配器

### 2. 配置文件
- ✅ `lib/supabase.ts` - Supabase 客户端配置
- ✅ `lib/user-service.ts` - 用户数据管理服务
- ✅ `auth.ts` - NextAuth 配置（已集成 Supabase 适配器）

### 3. 数据库结构
- ✅ `supabase-schema.sql` - 完整的数据库表结构
- ✅ NextAuth 所需表：users, accounts, sessions, verification_tokens
- ✅ 游戏相关表：user_game_stats, game_sessions, user_preferences
- ✅ 行级安全性 (RLS) 策略

### 4. API 路由
- ✅ `/api/game/save-session` - 保存游戏会话数据
- ✅ `/api/user/stats` - 获取用户统计数据
- ✅ `/api/user/preferences` - 管理用户偏好设置
- ✅ `/api/leaderboard` - 获取排行榜数据

## 🚀 部署步骤

### 第一步：设置 Supabase 数据库

1. **登录 Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **选择您的项目**
   - 项目 URL: `https://hycloobpgabrircstnxf.supabase.co`

3. **执行数据库脚本**
   - 进入 SQL Editor
   - 复制并执行 `supabase-schema.sql` 中的所有 SQL 语句
   - 这将创建所有必需的表和安全策略

### 第二步：配置环境变量

确保以下环境变量在 Vercel 中正确设置：

```bash
# NextAuth 配置
AUTH_SECRET=your_auth_secret
AUTH_URL=https://your-domain.vercel.app
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://hycloobpgabrircstnxf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 第三步：验证配置

运行以下脚本验证配置：

```bash
# 检查环境变量
node check-env-vars.js

# 验证 Google OAuth 配置
node verify-google-oauth.js
```

## 🎮 功能特性

### 用户管理
- **自动用户初始化**：首次登录时自动创建用户数据
- **游戏统计追踪**：高分、游戏次数、总游戏时间
- **偏好设置**：音效、音乐、难度、主题、语言

### 游戏数据存储
- **会话记录**：每次游戏的详细数据
- **统计更新**：自动更新用户统计信息
- **排行榜**：全局高分排行榜

### 数据安全
- **行级安全性**：用户只能访问自己的数据
- **身份验证**：所有 API 都需要用户登录
- **数据验证**：服务端数据验证和错误处理

## 💻 使用示例

### 在游戏组件中保存数据

```typescript
// 游戏结束时保存数据
const saveGameSession = async (gameData: {
  score: number;
  duration: number;
  level_reached?: number;
  coins_collected?: number;
  obstacles_avoided?: number;
}) => {
  try {
    const response = await fetch('/api/game/save-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameData),
    });

    const result = await response.json();
    if (result.success) {
      console.log('游戏数据保存成功:', result.stats);
    }
  } catch (error) {
    console.error('保存游戏数据失败:', error);
  }
};
```

### 获取用户统计数据

```typescript
const getUserStats = async () => {
  try {
    const response = await fetch('/api/user/stats');
    const result = await response.json();
    
    if (result.success) {
      const { stats, history, preferences } = result;
      console.log('用户统计:', stats);
      console.log('游戏历史:', history);
      console.log('用户偏好:', preferences);
    }
  } catch (error) {
    console.error('获取用户数据失败:', error);
  }
};
```

### 获取排行榜

```typescript
const getLeaderboard = async (limit = 10) => {
  try {
    const response = await fetch(`/api/leaderboard?limit=${limit}`);
    const result = await response.json();
    
    if (result.success) {
      console.log('排行榜:', result.leaderboard);
    }
  } catch (error) {
    console.error('获取排行榜失败:', error);
  }
};
```

## 🔧 数据库表结构

### 核心表

1. **users** - 用户基本信息
2. **accounts** - OAuth 账户信息
3. **sessions** - 用户会话
4. **user_game_stats** - 用户游戏统计
5. **game_sessions** - 游戏会话记录
6. **user_preferences** - 用户偏好设置

### 关键字段

```sql
-- 用户游戏统计
user_game_stats {
  user_id: UUID (外键)
  high_score: INTEGER
  games_played: INTEGER
  total_time_played: INTEGER
  last_played: TIMESTAMPTZ
}

-- 游戏会话
game_sessions {
  user_id: UUID (外键)
  score: INTEGER
  duration: INTEGER
  level_reached: INTEGER
  coins_collected: INTEGER
  obstacles_avoided: INTEGER
  game_data: JSONB
}
```

## 🛠️ 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `SUPABASE_SERVICE_ROLE_KEY` 是否正确
   - 验证 Supabase 项目 URL

2. **用户数据未保存**
   - 确认用户已登录
   - 检查 RLS 策略是否正确设置

3. **API 调用失败**
   - 验证 NextAuth 会话状态
   - 检查 API 路由权限

### 调试命令

```bash
# 检查环境变量
npm run dev
# 查看控制台日志

# 测试 Supabase 连接
# 在浏览器开发者工具中执行
fetch('/api/user/stats').then(r => r.json()).then(console.log)
```

## 📈 下一步

1. **前端集成**：在游戏组件中集成数据保存功能
2. **UI 组件**：创建用户统计和排行榜显示组件
3. **实时功能**：考虑添加实时排行榜更新
4. **数据分析**：添加更详细的游戏数据分析

## ✅ 验证清单

- [ ] Supabase 数据库表已创建
- [ ] 环境变量已在 Vercel 中设置
- [ ] Google OAuth 回调 URL 已配置
- [ ] 用户可以成功登录
- [ ] 游戏数据可以保存
- [ ] 排行榜可以正常显示
- [ ] 用户偏好设置可以更新

---

🎉 **集成完成！** 您的项目现在已经完全集成了 Supabase 和 Google 登录功能。