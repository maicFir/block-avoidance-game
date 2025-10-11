-- 修复 NextAuth 表的字段名以符合 NextAuth v5 的期望

-- 修复 accounts 表的字段名
ALTER TABLE accounts RENAME COLUMN provider_account_id TO "providerAccountId";
ALTER TABLE accounts RENAME COLUMN user_id TO "userId";
ALTER TABLE accounts RENAME COLUMN refresh_token TO "refresh_token";
ALTER TABLE accounts RENAME COLUMN access_token TO "access_token";
ALTER TABLE accounts RENAME COLUMN expires_at TO "expires_at";
ALTER TABLE accounts RENAME COLUMN token_type TO "token_type";
ALTER TABLE accounts RENAME COLUMN id_token TO "id_token";
ALTER TABLE accounts RENAME COLUMN session_state TO "session_state";
ALTER TABLE accounts RENAME COLUMN created_at TO "createdAt";
ALTER TABLE accounts RENAME COLUMN updated_at TO "updatedAt";

-- 修复 sessions 表的字段名
ALTER TABLE sessions RENAME COLUMN user_id TO "userId";
ALTER TABLE sessions RENAME COLUMN session_token TO "sessionToken";
ALTER TABLE sessions RENAME COLUMN expires TO "expires";
ALTER TABLE sessions RENAME COLUMN created_at TO "createdAt";
ALTER TABLE sessions RENAME COLUMN updated_at TO "updatedAt";

-- 修复 verification_tokens 表的字段名
ALTER TABLE verification_tokens RENAME COLUMN expires TO "expires";
ALTER TABLE verification_tokens RENAME COLUMN created_at TO "createdAt";

-- 重新创建约束（因为字段名改变了）
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_provider_provider_account_id_key;
ALTER TABLE accounts ADD CONSTRAINT accounts_provider_providerAccountId_key UNIQUE (provider, "providerAccountId");

-- 确保表没有 RLS 启用（NextAuth 需要完全访问权限）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens DISABLE ROW LEVEL SECURITY;