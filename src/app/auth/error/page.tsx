"use client";

import { useSearchParams } from "next/navigation";
import { Box, Typography, Button } from "@mui/material";
import Link from "next/link";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "服务器配置错误，请联系管理员";
      case "AccessDenied":
        return "访问被拒绝，您没有权限访问此应用";
      case "Verification":
        return "验证失败，请重试";
      case "OAuthSignin":
        return "Google OAuth 登录失败 - 可能是网络连接或配置问题";
      case "OAuthCallback":
        return "OAuth 回调处理失败，请检查回调 URL 配置";
      case "OAuthCreateAccount":
        return "使用 OAuth 创建账户时失败";
      case "Default":
        return "登录过程中发生错误，请重试";
      default:
        return "未知错误，请重试或联系管理员";
    }
  };

  const getErrorDetails = (error: string | null) => {
    switch (error) {
      case "OAuthSignin":
        return "这通常是由于网络连接问题、Google OAuth 配置错误或代理设置问题导致的。请检查：1) 网络连接是否正常 2) Google Client ID/Secret 是否正确 3) 代理设置是否正确";
      case "OAuthCallback":
        return "回调 URL 可能配置错误。请确保 Google Cloud Console 中的回调 URL 设置为：http://localhost:3000/api/auth/callback/google";
      default:
        return null;
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      padding={3}
    >
      <Typography variant="h4" component="h1" gutterBottom color="error">
        登录失败
      </Typography>
      
      <Typography variant="body1" gutterBottom textAlign="center" maxWidth={400}>
        {getErrorMessage(error)}
      </Typography>
      
      {getErrorDetails(error) && (
        <Typography variant="body2" color="text.secondary" gutterBottom textAlign="center" maxWidth={600} sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          {getErrorDetails(error)}
        </Typography>
      )}
      
      {error && (
        <Typography variant="caption" color="text.secondary" gutterBottom>
          错误代码: {error} | 时间: {new Date().toLocaleString()}
        </Typography>
      )}
      
      <Box mt={3} display="flex" gap={2}>
        <Button variant="contained" component={Link} href="/">
          返回首页
        </Button>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          重试登录
        </Button>
      </Box>
    </Box>
  );
}