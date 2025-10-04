#!/bin/bash

# 设置代理环境变量
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890

# 设置 Node.js 特定的代理配置
export NODE_TLS_REJECT_UNAUTHORIZED=0
export NODE_OPTIONS="--max-old-space-size=4096"

echo "🌐 代理环境变量已设置:"
echo "HTTP_PROXY=$HTTP_PROXY"
echo "HTTPS_PROXY=$HTTPS_PROXY"
echo "NODE_TLS_REJECT_UNAUTHORIZED=$NODE_TLS_REJECT_UNAUTHORIZED"

# 测试网络连接
echo "🔍 测试网络连接..."
curl -I --connect-timeout 10 --proxy $HTTPS_PROXY https://accounts.google.com/.well-known/openid_configuration

if [ $? -eq 0 ]; then
    echo "✅ 网络连接测试成功"
else
    echo "❌ 网络连接测试失败，但继续启动服务器..."
fi

# 启动开发服务器
echo "🚀 启动开发服务器..."
pnpm dev