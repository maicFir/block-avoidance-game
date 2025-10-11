/**
 * 在 Supabase 数据库中创建游戏相关表
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 从环境变量加载配置
function loadEnvFile(filePath) {
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

async function createTableDirectly(supabase, tableName, createSQL) {
  try {
    console.log(`📝 创建表: ${tableName}`);
    
    // 尝试查询表是否存在
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (!error) {
      console.log(`  ✅ 表 ${tableName} 已存在`);
      return true;
    }

    // 表不存在，需要创建
    console.log(`  📋 表 ${tableName} 不存在，正在创建...`);
    
    // 使用 REST API 直接执行 SQL
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ 
          sql: createSQL 
        })
      }
    );

    if (response.ok) {
      console.log(`  ✅ 表 ${tableName} 创建成功`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`  ❌ 创建表 ${tableName} 失败: ${errorText}`);
      return false;
    }

  } catch (err) {
    console.log(`  ❌ 创建表 ${tableName} 异常: ${err.message}`);
    return false;
  }
}

async function setupGameTables() {
  console.log('🎮 设置游戏相关数据库表...\n');

  // 加载环境变量
  loadEnvFile('.env.development');
  loadEnvFile('.env.local');

  // 检查必需的环境变量
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ 缺少必需的环境变量');
    console.error('请确保设置了 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY');
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

    console.log('🔗 连接到 Supabase...\n');

    // 定义要创建的表
    const tables = [
      {
        name: 'user_game_stats',
        sql: `
          CREATE TABLE IF NOT EXISTS user_game_stats (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            high_score INTEGER DEFAULT 0,
            games_played INTEGER DEFAULT 0,
            total_time_played INTEGER DEFAULT 0,
            last_played TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id)
          );
        `
      },
      {
        name: 'game_sessions',
        sql: `
          CREATE TABLE IF NOT EXISTS game_sessions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            score INTEGER NOT NULL DEFAULT 0,
            duration INTEGER NOT NULL DEFAULT 0,
            level_reached INTEGER DEFAULT 1,
            coins_collected INTEGER DEFAULT 0,
            obstacles_avoided INTEGER DEFAULT 0,
            game_data JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      },
      {
        name: 'user_preferences',
        sql: `
          CREATE TABLE IF NOT EXISTS user_preferences (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            sound_enabled BOOLEAN DEFAULT true,
            music_enabled BOOLEAN DEFAULT true,
            difficulty_level TEXT DEFAULT 'normal',
            theme TEXT DEFAULT 'default',
            language TEXT DEFAULT 'zh-CN',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id)
          );
        `
      }
    ];

    // 逐个创建表
    let successCount = 0;
    for (const table of tables) {
      const success = await createTableDirectly(supabase, table.name, table.sql);
      if (success) successCount++;
    }

    console.log(`\n📊 创建结果: ${successCount}/${tables.length} 个表创建成功`);

    // 验证表是否创建成功
    console.log('\n🔍 验证表创建结果:');
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table.name)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`  ❌ ${table.name}: ${error.message}`);
        } else {
          console.log(`  ✅ ${table.name}: 表可用`);
        }
      } catch (err) {
        console.log(`  ❌ ${table.name}: ${err.message}`);
      }
    }

    if (successCount === tables.length) {
      console.log('\n🎉 所有游戏表设置完成！');
      console.log('\n📝 下一步:');
      console.log('  1. 重新启动开发服务器');
      console.log('  2. 测试 Google 登录功能');
    } else {
      console.log('\n⚠️  部分表创建失败，请手动在 Supabase Dashboard 中执行 create-game-tables.sql');
    }

  } catch (error) {
    console.error('❌ 设置失败:', error.message);
    console.log('\n💡 建议: 请在 Supabase Dashboard 的 SQL Editor 中手动执行 create-game-tables.sql');
  }
}

// 运行设置
setupGameTables().catch(console.error);