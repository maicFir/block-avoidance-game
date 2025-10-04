/**
 * @description Google登录组件
 * @author Elen
 */
"use client";
import React, { memo, useState } from "react";
import { Typography, Avatar, Box, IconButton } from "@mui/material";
import { signIn, signOut, useSession } from "next-auth/react";
import { ExitToApp } from "@mui/icons-material";

interface Props {}

const Index: React.FC<Props> = props => {
  const {} = props;
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { 
        callbackUrl: "/",
        redirect: true 
      });
    } catch (error) {
      console.error("登录失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("退出登录失败:", error);
    }
  };

  if (status === 'loading') {
    return (
      <Typography
        className="flex justify-center items-center p-2 bg-gray-200 text-gray-600 rounded"
      >
        加载中...
      </Typography>
    );
  }

  if (session?.user) {
    return (
      <Box className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
        <Box className="flex items-center gap-2">
          {session.user.image && (
            <Avatar 
              src={session.user.image} 
              alt={session.user.name || "用户头像"}
              sx={{ width: 32, height: 32 }}
            />
          )}
          <Box>
            <Typography variant="body2" className="font-medium text-green-800">
              {session.user.name}
            </Typography>
            <Typography variant="caption" className="text-green-600">
              {session.user.email}
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={handleSignOut}
          size="small"
          className="text-green-700 hover:bg-green-100"
          title="退出登录"
        >
          <ExitToApp fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  return (
    <Typography
      className="flex justify-center cursor-pointer p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
      onClick={handleGoogleSignIn}
      component="button"
      disabled={isLoading}
    >
      {isLoading ? "登录中..." : "Google 登录"}
    </Typography>
  );
};

export default memo(Index);
