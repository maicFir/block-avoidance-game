"use client";
import { Box, Typography, Button, Paper, Alert } from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "OAuthSignin":
        return "OAuth登录初始化失败，请检查网络连接";
      case "OAuthCallback":
        return "OAuth回调处理失败，请重试";
      case "OAuthCreateAccount":
        return "创建OAuth账户失败";
      case "EmailCreateAccount":
        return "创建邮箱账户失败";
      case "Callback":
        return "回调URL处理失败";
      case "OAuthAccountNotLinked":
        return "该邮箱已与其他账户关联";
      case "EmailSignin":
        return "邮箱登录失败";
      case "CredentialsSignin":
        return "凭据登录失败";
      case "SessionRequired":
        return "需要登录会话";
      default:
        return error ? `登录失败: ${error}` : null;
    }
  };

  const errorMessage = getErrorMessage(error);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      padding={3}
      bgcolor="#f5f5f5"
    >
      <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          登录
        </Typography>
        
        <Typography variant="body2" gutterBottom textAlign="center" color="text.secondary" mb={3}>
          选择一种方式登录到游戏
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}
        
        <Button
          onClick={handleGoogleSignIn}
          variant="contained"
          fullWidth
          size="large"
          startIcon={<GoogleIcon />}
          sx={{
            backgroundColor: "#4285f4",
            "&:hover": {
              backgroundColor: "#357ae8",
            },
          }}
        >
          使用 Google 登录
        </Button>
        
        <Box mt={3} textAlign="center">
          <Typography variant="caption" color="text.secondary">
            登录即表示您同意我们的服务条款
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <SignInContent />
    </Suspense>
  );
}