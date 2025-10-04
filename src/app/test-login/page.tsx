'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function TestLoginPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('开始 Google 登录...');
      
      const result = await signIn('google', { 
        redirect: false,
        callbackUrl: '/test-login'
      });
      
      console.log('登录结果:', result);
      
      if (result?.error) {
        setError(`登录错误: ${result.error}`);
      } else if (result?.url) {
        // 手动重定向到 Google
        window.location.href = result.url;
      }
    } catch (err) {
      console.error('登录异常:', err);
      setError(`登录异常: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="p-8">加载中...</div>;
  }

  if (session) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">登录成功！</h1>
        <div className="mb-4">
          <p>欢迎，{session.user?.name}</p>
          <p>邮箱：{session.user?.email}</p>
          {session.user?.image && (
            <img 
              src={session.user.image} 
              alt="头像" 
              className="w-16 h-16 rounded-full mt-2"
            />
          )}
        </div>
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          退出登录
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">测试 Google 登录</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full disabled:opacity-50"
      >
        {isLoading ? '登录中...' : '使用 Google 登录'}
      </button>
      
      <div className="mt-8 text-sm text-gray-600">
        <h2 className="font-semibold mb-2">调试信息：</h2>
        <p>状态：{status}</p>
        <p>会话：{session ? '已登录' : '未登录'}</p>
        <p>环境：{process.env.NODE_ENV}</p>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <h3 className="font-semibold mb-1">快速链接：</h3>
        <a href="/api/auth/providers" className="block text-blue-500 hover:underline">
          查看 Providers
        </a>
        <a href="/api/auth/signin" className="block text-blue-500 hover:underline">
          NextAuth 登录页
        </a>
      </div>
    </div>
  );
}