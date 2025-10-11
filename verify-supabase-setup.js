/**
 * 验证 Supabase 数据库设置和表结构
 */

const { createClient } = require('@supabase/supabase-js');

// 从环境变量加载配置
function loadEnvFile(filePath) {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const envPath = path.resolve(filePath);
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key.trim()] = value.trim();
        }
      }
    });
  } catch (error) {
    console.log(`⚠️  无法读取 ${filePath}:`, error.message);
  }
}

async function verifySupabaseSetup() {
  console.log('🔍 验证 Supabase 数据库设置...\n');

  // 加载环境变量
  loadEnvFile('.env.development');
  loadEnvFile('.env.local');

  // 检查必需的环境变量
  const requiredVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY
  };

  console.log('📋 环境变量检查:');
  let hasAllVars = true;
  for (const [key, value] of Object.entries(requiredVars)) {
    const status = value ? '✅' : '❌';
    console.log(`  ${status} ${key}: ${value ? '已设置' : '未设置'}`);
    if (!value) hasAllVars = false;
  }

  if (!hasAllVars) {
    console.log('\n❌ 缺少必需的环境变量，请检查配置');
    return;
  }

  try {
    // 创建 Supabase 客户端（使用服务角色密钥）
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('\n🔗 测试 Supabase 连接...');

    // 检查 NextAuth 所需的表
    const requiredTables = ['users', 'accounts', 'sessions', 'verification_tokens'];
    const gameRelatedTables = ['user_game_stats', 'game_sessions', 'user_preferences'];

    console.log('\n📊 检查 NextAuth 所需表:');
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`  ❌ ${table}: ${error.message}`);
        } else {
          console.log(`  ✅ ${table}: 表存在`);
        }
      } catch (err) {
        console.log(`  ❌ ${table}: ${err.message}`);
      }
    }

    console.log('\n🎮 检查游戏相关表:');
    for (const table of gameRelatedTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`  ❌ ${table}: ${error.message}`);
        } else {
          console.log(`  ✅ ${table}: 表存在`);
        }
      } catch (err) {
        console.log(`  ❌ ${table}: ${err.message}`);
      }
    }

    // 测试基本的数据库操作
    console.log('\n🧪 测试数据库操作权限...');
    
    try {
      // 尝试查询用户表
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, name')
        .limit(5);

      if (usersError) {
        console.log(`  ❌ 查询用户表失败: ${usersError.message}`);
      } else {
        console.log(`  ✅ 查询用户表成功，找到 ${users.length} 条记录`);
      }
    } catch (err) {
      console.log(`  ❌ 查询用户表异常: ${err.message}`);
    }

    console.log('\n📝 建议:');
    console.log('  1. 如果表不存在，请在 Supabase Dashboard 的 SQL Editor 中执行 supabase-schema.sql');
    console.log('  2. 确保 RLS (行级安全性) 策略已正确配置');
    console.log('  3. 验证服务角色密钥具有足够的权限');

  } catch (error) {
    console.error('❌ Supabase 连接失败:', error.message);
  }
}

// 运行验证
verifySupabaseSetup().catch(console.error);