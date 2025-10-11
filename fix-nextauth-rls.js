const { createClient } = require('@supabase/supabase-js');

// 手动读取环境变量文件
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.development');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  } catch (error) {
    console.log('⚠️  无法读取 .env.development 文件，使用系统环境变量');
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少必要的环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixNextAuthRLS() {
  console.log('🔧 修复 NextAuth 表的 RLS 策略...\n');

  const nextAuthTables = ['users', 'accounts', 'sessions', 'verification_tokens'];
  
  for (const tableName of nextAuthTables) {
    try {
      console.log(`📋 处理表: ${tableName}`);
      
      // 1. 检查表是否存在 RLS
      const { data: tableInfo, error: tableError } = await supabase
        .from('pg_tables')
        .select('*')
        .eq('tablename', tableName)
        .eq('schemaname', 'public');
      
      if (tableError) {
        console.error(`❌ 检查表 ${tableName} 时出错:`, tableError.message);
        continue;
      }
      
      if (!tableInfo || tableInfo.length === 0) {
        console.log(`⚠️  表 ${tableName} 不存在`);
        continue;
      }
      
      // 2. 禁用 RLS（对于 NextAuth 表，通常需要禁用 RLS 或设置适当的策略）
      const { error: disableRLSError } = await supabase.rpc('exec', {
        sql: `ALTER TABLE public.${tableName} DISABLE ROW LEVEL SECURITY;`
      });
      
      if (disableRLSError) {
        console.log(`⚠️  无法禁用 ${tableName} 的 RLS（可能已经禁用）:`, disableRLSError.message);
      } else {
        console.log(`✅ 已禁用表 ${tableName} 的 RLS`);
      }
      
      // 3. 测试基本查询
      const { data: testData, error: testError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (testError) {
        console.error(`❌ 测试查询 ${tableName} 失败:`, testError.message);
      } else {
        console.log(`✅ 表 ${tableName} 查询正常`);
      }
      
    } catch (error) {
      console.error(`❌ 处理表 ${tableName} 时发生错误:`, error.message);
    }
    
    console.log(''); // 空行分隔
  }
  
  // 4. 测试 NextAuth 适配器常用的查询
  console.log('🧪 测试 NextAuth 适配器查询...');
  
  try {
    // 测试查找用户账户的查询（这是失败的查询）
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('users(*)')
      .eq('provider', 'google')
      .eq('providerAccountId', 'test-id')
      .limit(1);
    
    if (accountError) {
      console.error('❌ 账户查询测试失败:', accountError.message);
    } else {
      console.log('✅ 账户查询测试成功');
    }
  } catch (error) {
    console.error('❌ 查询测试时发生错误:', error.message);
  }
}

// 运行修复
fixNextAuthRLS().then(() => {
  console.log('\n🎉 NextAuth RLS 修复完成！');
}).catch((error) => {
  console.error('\n❌ 修复过程中发生错误:', error);
});