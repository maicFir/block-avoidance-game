#!/bin/bash

# Vercel 部署脚本
# 使用方法: ./deploy-to-vercel.sh

set -e

echo "🚀 开始部署到 Vercel..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装"
    echo "请运行: npm i -g vercel"
    exit 1
fi

# 检查是否已登录 Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 请先登录 Vercel..."
    vercel login
fi

# 检查必要的文件
echo "📋 检查配置文件..."

if [ ! -f "vercel.json" ]; then
    echo "❌ 缺少 vercel.json 配置文件"
    exit 1
fi

if [ ! -f ".env.production.example" ]; then
    echo "❌ 缺少 .env.production.example 模板文件"
    exit 1
fi

echo "✅ 配置文件检查完成"

# 构建检查
echo "🔨 检查构建配置..."

if [ ! -f "package.json" ]; then
    echo "❌ 缺少 package.json 文件"
    exit 1
fi

# 检查构建脚本
if ! grep -q '"build"' package.json; then
    echo "❌ package.json 中缺少 build 脚本"
    exit 1
fi

echo "✅ 构建配置检查完成"

# 提醒用户配置环境变量
echo ""
echo "⚠️  重要提醒："
echo "请确保在 Vercel Dashboard 中配置以下敏感环境变量："
echo "  - AUTH_SECRET"
echo "  - AUTH_GOOGLE_SECRET"
echo "  - NEXTAUTH_SECRET"
echo "  - GOOGLE_CLIENT_SECRET"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "详细配置说明请参考 VERCEL_DEPLOYMENT_GUIDE.md"
echo ""

read -p "是否已在 Vercel Dashboard 中配置了所有敏感环境变量？(y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "请先在 Vercel Dashboard 中配置环境变量，然后重新运行此脚本"
    echo "配置地址: https://vercel.com/dashboard -> 选择项目 -> Settings -> Environment Variables"
    exit 1
fi

# 开始部署
echo "🚀 开始部署..."

# 部署到生产环境
vercel --prod

echo ""
echo "✅ 部署完成！"
echo ""
echo "📝 部署后检查清单："
echo "  1. 访问您的网站确认页面正常加载"
echo "  2. 测试 Google OAuth 登录功能"
echo "  3. 检查浏览器控制台是否有错误"
echo "  4. 验证 Supabase 数据库连接"
echo ""
echo "🔧 如果遇到问题，请检查："
echo "  - Vercel 部署日志"
echo "  - 环境变量配置"
echo "  - Google OAuth 重定向 URI 设置"
echo "  - Supabase Site URL 配置"
echo ""
echo "📖 详细故障排除指南请参考 VERCEL_DEPLOYMENT_GUIDE.md"