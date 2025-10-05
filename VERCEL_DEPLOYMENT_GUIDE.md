# Vercel 生产环境部署指南

## 🚀 概述

本指南将帮助您将 Block Avoidance Game 项目安全地部署到 Vercel 生产环境，包括正确的环境变量配置和安全最佳实践。

## 📋 必需的环境变量

### 🔐 敏感变量（仅在 Vercel Dashboard 中配置）

这些变量包含敏感信息，**绝对不能**提交到 Git 仓库：

```bash
# NextAuth v5 认证密钥
AUTH_SECRET=your_auth_secret_here

# Google OAuth 客户端密钥
AUTH_GOOGLE_SECRET=your_google_client_secret

# NextAuth v4 兼容性（如果需要）
NEXTAUTH_SECRET=your_auth_secret_here
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Supabase 服务角色密钥（服务端专用）
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 🌐 公开变量（可以在代码中设置）

这些变量不包含敏感信息，可以在代码中配置：

```bash
# 生产环境 URL
AUTH_URL=https://your-domain.vercel.app
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_NEXTAUTH_URL=https://your-domain.vercel.app

# Google OAuth 客户端 ID（公开）
AUTH_GOOGLE_ID=your_google_client_id
GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Supabase 公开配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🛠️ Vercel 配置步骤

### 1. 在 Vercel Dashboard 中配置环境变量

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下敏感变量：

| 变量名 | 值 | 环境 |
|--------|----|----- |
| `AUTH_SECRET` | `seMdy6BV4J6gbI1ihPphIXEo+fth0DS1/XefGXEVzu0=` | Production |
| `AUTH_GOOGLE_SECRET` | `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` | Production |
| `NEXTAUTH_SECRET` | `seMdy6BV4J6gbI1ihPphIXEo+fth0DS1/XefGXEVzu0=` | Production |
| `GOOGLE_CLIENT_SECRET` | `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` | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | `your_supabase_service_role_key` | Production |

### 2. 更新 Google OAuth 配置

确保在 [Google Cloud Console](https://console.cloud.google.com/) 中：

1. 添加您的 Vercel 域名到授权的重定向 URI：
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```

2. 添加您的域名到授权的 JavaScript 来源：
   ```
   https://your-domain.vercel.app
   ```

### 3. 更新 Supabase 配置

在 Supabase Dashboard 中：

1. 进入 **Settings** → **API**
2. 在 **Site URL** 中添加您的 Vercel 域名：
   ```
   https://your-domain.vercel.app
   ```

## 📁 文件结构建议

```
project/
├── .env.local                 # 本地开发（不提交）
├── .env.development          # 开发环境配置（不提交）
├── .env.production.example   # 生产环境模板（可提交）
├── .gitignore               # 确保排除敏感文件
└── vercel.json              # Vercel 配置文件
```

## 🔒 安全最佳实践

### 1. .gitignore 配置

确保您的 `.gitignore` 包含：

```gitignore
# 环境变量文件
.env
.env.local
.env.development
.env.production
.env.*.local

# Vercel
.vercel
```

### 2. 环境变量分离

- **敏感变量**：仅在 Vercel Dashboard 中配置
- **公开变量**：可以在代码中硬编码或使用 `vercel.json`

### 3. 验证配置

部署前确保：
- [ ] 所有敏感变量已在 Vercel Dashboard 中设置
- [ ] Google OAuth 重定向 URI 已更新
- [ ] Supabase Site URL 已更新
- [ ] 域名配置正确

## 🚨 常见问题

### 1. NextAuth 回调错误
- 检查 `AUTH_URL` 是否与实际域名匹配
- 确认 Google OAuth 重定向 URI 配置正确

### 2. Supabase 连接问题
- 验证 `SUPABASE_SERVICE_ROLE_KEY` 在 Vercel 中正确设置
- 检查 Supabase Site URL 配置

### 3. 环境变量未生效
- 重新部署项目以应用新的环境变量
- 检查变量名是否完全匹配

## 📞 支持

如果遇到问题，请检查：
1. Vercel 部署日志
2. 浏览器开发者工具控制台
3. NextAuth 调试模式输出

---

**注意**：请将此文件中的示例值替换为您的实际配置值，并确保敏感信息不会被提交到版本控制系统。