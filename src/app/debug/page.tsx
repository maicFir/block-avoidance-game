"use client";

import { Box, Typography, Paper, Button, Alert } from "@mui/material";
import { signIn, getProviders } from "next-auth/react";
import { useEffect, useState } from "react";

export default function DebugPage() {
  const [providers, setProviders] = useState<any>(null);
  const [envCheck, setEnvCheck] = useState<any>({});

  useEffect(() => {
    // 检查环境变量
    const checkEnv = {
      hasGoogleClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      hasNextAuthUrl: !!process.env.NEXT_PUBLIC_NEXTAUTH_URL,
      currentUrl: window.location.origin,
    };
    setEnvCheck(checkEnv);

    // 获取可用的providers
    getProviders().then((providers) => {
      console.log("Available providers:", providers);
      setProviders(providers);
    }).catch((error) => {
      console.error("Error getting providers:", error);
    });
  }, []);

  const testGoogleAuth = async () => {
    try {
      console.log("🚀 Starting Google OAuth test...");
      console.log("🔍 Environment check:", {
        hasGoogleClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        hasNextAuthUrl: !!process.env.NEXT_PUBLIC_NEXTAUTH_URL,
        currentOrigin: window.location.origin
      });
      
      // 测试API路由是否可访问
      console.log("🔗 Testing NextAuth API route...");
      const apiResponse = await fetch('/api/auth/providers');
      const apiData = await apiResponse.json();
      console.log("📡 API Response:", apiData);
      
      const result = await signIn("google", { 
        callbackUrl: "/",
        redirect: false 
      });
      console.log("✅ OAuth result:", result);
      
      if (result?.error) {
        console.error("❌ OAuth Error Details:", {
          error: result.error,
          status: result.status,
          ok: result.ok,
          url: result.url
        });
      }
    } catch (error) {
      console.error("💥 OAuth Exception:", error);
      console.error("📋 Error Details:", {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
    }
  };

  const testApiRoute = async () => {
    try {
      console.log("🧪 Testing NextAuth API routes...");
      
      // 测试 providers 端点
      const providersResponse = await fetch('/api/auth/providers');
      console.log("🔌 Providers endpoint:", {
        status: providersResponse.status,
        ok: providersResponse.ok,
        data: await providersResponse.json()
      });
      
      // 测试 session 端点
      const sessionResponse = await fetch('/api/auth/session');
      console.log("👤 Session endpoint:", {
        status: sessionResponse.status,
        ok: sessionResponse.ok,
        data: await sessionResponse.json()
      });
      
      // 测试 csrf 端点
      const csrfResponse = await fetch('/api/auth/csrf');
      console.log("🔐 CSRF endpoint:", {
        status: csrfResponse.status,
        ok: csrfResponse.ok,
        data: await csrfResponse.json()
      });
      
    } catch (error) {
      console.error("💥 API Test Error:", error);
    }
  };

  const testGoogleCredentials = async () => {
    try {
      console.log("🔑 Testing Google OAuth credentials...");
      
      // 检查客户端 ID 格式
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const isValidClientId = clientId && clientId.endsWith('.apps.googleusercontent.com');
      
      console.log("📋 Credential check:", {
        clientId: clientId,
        isValidFormat: isValidClientId,
        length: clientId?.length
      });
      
      // 尝试访问 Google OAuth 发现端点
      const discoveryUrl = 'https://accounts.google.com/.well-known/openid_configuration';
      const discoveryRes = await fetch(discoveryUrl);
      const discoveryData = await discoveryRes.json();
      console.log("🌐 Google OAuth discovery endpoint:", discoveryData.authorization_endpoint);
      
      // 构建 OAuth URL 来测试客户端 ID
      const authUrl = new URL(discoveryData.authorization_endpoint);
      authUrl.searchParams.set('client_id', clientId || '');
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'openid email profile');
      authUrl.searchParams.set('redirect_uri', `${window.location.origin}/api/auth/callback/google`);
      authUrl.searchParams.set('state', 'test');
      
      console.log("🔗 Constructed OAuth URL:", authUrl.toString());
      console.log("✅ Credential validation completed - check console for details");
      
    } catch (error) {
      console.error("❌ Credential test error:", error);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        NextAuth 调试页面
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          环境变量检查
        </Typography>
        <Typography variant="body2">
          当前URL: {envCheck.currentUrl}
        </Typography>
        <Typography variant="body2">
          Google Client ID: {envCheck.hasGoogleClientId ? "✅ 已设置" : "❌ 未设置"}
        </Typography>
        <Typography variant="body2">
          NextAuth URL: {envCheck.hasNextAuthUrl ? "✅ 已设置" : "❌ 未设置"}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          可用的认证提供商
        </Typography>
        {providers ? (
          <pre>{JSON.stringify(providers, null, 2)}</pre>
        ) : (
          <Typography>加载中...</Typography>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          OAuth 测试
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          点击下面的按钮测试Google OAuth，请查看浏览器控制台获取详细日志
        </Alert>
        <Button 
          variant="contained" 
          onClick={testGoogleAuth}
          color="primary"
          sx={{ mr: 2, mb: 2 }}
        >
          测试 Google OAuth
        </Button>
        <Button 
          variant="outlined" 
          onClick={testApiRoute}
          color="secondary"
          sx={{ mr: 2, mb: 2 }}
        >
          测试 API 路由
        </Button>
        <Button 
          variant="outlined" 
          onClick={testGoogleCredentials}
          color="success"
          sx={{ mb: 2 }}
        >
          验证 Google 凭据
        </Button>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Google Cloud Console 配置检查
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          如果遇到 OAuthSignin 错误，请检查以下 Google Cloud Console 配置：
        </Alert>
        <Typography variant="body2" component="div">
          <strong>1. 授权重定向 URI (必须完全匹配):</strong><br/>
          • http://localhost:3000/api/auth/callback/google<br/>
          <br/>
          <strong>2. 授权的 JavaScript 来源:</strong><br/>
          • http://localhost:3000<br/>
          <br/>
          <strong>3. OAuth 同意屏幕配置:</strong><br/>
          • 应用名称: 已设置<br/>
          • 用户支持邮箱: 已设置<br/>
          • 开发者联系信息: 已设置<br/>
          • 测试用户: 添加您的 Google 账号<br/>
          <br/>
          <strong>4. 凭据配置:</strong><br/>
           • 客户端 ID: {envCheck.hasGoogleClientId ? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID : '未设置'}<br/>
           • 客户端密钥: 请检查 .env.local 文件<br/>
          <br/>
          <strong>5. 常见错误排查:</strong><br/>
          • OAuthSignin: 通常是重定向 URI 不匹配<br/>
          • redirect_uri_mismatch: 检查授权重定向 URI<br/>
          • unauthorized_client: 检查客户端 ID 和密钥<br/>
          • access_denied: 检查 OAuth 同意屏幕配置
        </Typography>
      </Paper>
    </Box>
  );
}