import "@/lib/fetch-patch"; // ✅ 必须放在最上面，确保全局 fetch 被 patch

import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { createClient } from "@supabase/supabase-js";
import { UserService } from "./lib/user-service";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

console.log("🌐 NextAuth v5 启动，环境配置:", { 
  hasSecret: !!process.env.AUTH_SECRET,
  hasGoogleId: !!process.env.AUTH_GOOGLE_ID,
  hasGoogleSecret: !!process.env.AUTH_GOOGLE_SECRET,
  authUrl: process.env.AUTH_URL
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: process.env.NODE_ENV === "development", // 只在开发环境启用调试
  trustHost: true, // 信任 Vercel 的主机头
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      // 暂时注释掉用户初始化逻辑，等游戏表创建完成后再启用
      // if (user.id) {
      //   // 检查用户是否已有游戏统计数据，如果没有则初始化
      //   const existingStats = await UserService.getUserGameStats(user.id);
      //   if (!existingStats) {
      //     await UserService.initializeNewUser(user.id);
      //   }
      // }
      return true; // 允许所有 Google 账号
    },
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
  },
  logger: {
    error(error: Error) {
      console.error("❌ NextAuth Error", error);
    },
    debug(code: any, metadata?: any) {
      console.log("🐛 NextAuth Debug", code, metadata);
    },
  },
});