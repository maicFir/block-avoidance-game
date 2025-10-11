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

async function checkTableStructure() {
  console.log('🔍 检查 NextAuth 表结构...\n');

  const nextAuthTables = ['users', 'accounts', 'sessions', 'verification_tokens'];
  
  for (const tableName of nextAuthTables) {
    try {
      console.log(`📋 表: ${tableName}`);
      
      // 尝试获取表的所有列
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0); // 只获取结构，不获取数据
      
      if (error) {
        console.error(`❌ 无法访问表 ${tableName}:`, error.message);
      } else {
        console.log(`✅ 表 ${tableName} 存在且可访问`);
        
        // 尝试插入一个测试记录来查看字段要求
        if (tableName === 'accounts') {
          const { error: insertError } = await supabase
            .from('accounts')
            .insert({
              // 尝试不同的字段名
              provider: 'test',
              provider_account_id: 'test', // 注意这里用下划线
              type: 'oauth',
              user_id: 'test-user-id'
            });
          
          if (insertError) {
            console.log(`📝 accounts 表字段信息:`, insertError.message);
          } else {
            console.log(`✅ accounts 表插入测试成功`);
            // 删除测试记录
            await supabase.from('accounts').delete().eq('provider', 'test');
          }
        }
      }
      
    } catch (error) {
      console.error(`❌ 检查表 ${tableName} 时发生错误:`, error.message);
    }
    
    console.log(''); // 空行分隔
  }
  
  // 尝试原始的查询来看具体错误
  console.log('🧪 测试原始查询...');
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('provider', 'google')
      .limit(1);
    
    if (error) {
      console.error('❌ 原始查询错误:', error.message);
    } else {
      console.log('✅ 原始查询成功');
    }
  } catch (error) {
    console.error('❌ 查询测试时发生错误:', error.message);
  }
}

// 运行检查
checkTableStructure().then(() => {
  console.log('\n🎉 表结构检查完成！');
}).catch((error) => {
  console.error('\n❌ 检查过程中发生错误:', error);
});