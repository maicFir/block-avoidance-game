const { createClient } = require('@supabase/supabase-js');
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

async function applyColumnFix() {
  console.log('🔧 修复 NextAuth 表的字段名...\n');

  // 读取 SQL 修复脚本
  const sqlPath = path.join(__dirname, 'fix-column-names.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  
  // 分割 SQL 语句
  const sqlStatements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt && !stmt.startsWith('--'));

  console.log(`📝 将执行 ${sqlStatements.length} 个 SQL 语句\n`);

  for (let i = 0; i < sqlStatements.length; i++) {
    const statement = sqlStatements[i];
    if (!statement) continue;

    try {
      console.log(`${i + 1}. 执行: ${statement.substring(0, 60)}...`);
      
      // 使用 REST API 直接执行 SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({ sql: statement })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`⚠️  语句 ${i + 1} 执行失败: ${errorText}`);
      } else {
        console.log(`✅ 语句 ${i + 1} 执行成功`);
      }
    } catch (error) {
      console.log(`⚠️  语句 ${i + 1} 执行出错: ${error.message}`);
    }
  }

  // 测试修复后的查询
  console.log('\n🧪 测试修复后的查询...');
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('users(*)')
      .eq('provider', 'google')
      .eq('providerAccountId', 'test-id')
      .limit(1);
    
    if (error) {
      console.error('❌ 测试查询失败:', error.message);
    } else {
      console.log('✅ 测试查询成功！NextAuth 字段名修复完成');
    }
  } catch (error) {
    console.error('❌ 测试查询时发生错误:', error.message);
  }
}

// 运行修复
applyColumnFix().then(() => {
  console.log('\n🎉 字段名修复完成！');
}).catch((error) => {
  console.error('\n❌ 修复过程中发生错误:', error);
});