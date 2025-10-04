import "@/lib/fetch-patch"; // ✅ 必须放在最上面，确保全局 fetch 被 patch

import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";

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
  debug: true, // 强制启用调试模式
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
    },
    async jwt({ token, account }: { token: any; account: any }) {
      if (account) token.accessToken = account.access_token;
      return token;
    },
    async signIn() {
      return true; // 允许所有 Google 账号
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  logger: {
    error(code: any, metadata: any) {
      console.error("❌ NextAuth Error", code, metadata);
    },
    debug(code: any, metadata: any) {
      console.log("🐛 NextAuth Debug", code, metadata);
    },
  },
});