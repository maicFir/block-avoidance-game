#!/usr/bin/env node

/**
 * 环境变量检查脚本
 * 验证 NextAuth 和 Supabase 所需的环境变量
 */

// 尝试加载 .env 文件（如果存在）
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envFiles = ['.env.local', '.env.production', '.env'];
  
  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      console.log(`📁 加载环境文件: ${envFile}`);
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
      break;
    }
  }
}

// 必需的环境变量配置
const requiredEnvVars = {
  // NextAuth v5 核心变量
  'AUTH_SECRET': {
    required: true,
    sensitive: true,
    description: 'NextAuth v5 密钥，用于加密 JWT 和会话'
  },
  'AUTH_URL': {
    required: true,
    sensitive: false,
    description: 'NextAuth v5 应用程序 URL'
  },
  'AUTH_GOOGLE_ID': {
    required: true,
    sensitive: false,
    description: 'NextAuth v5 Google OAuth 客户端 ID'
  },
  'AUTH_GOOGLE_SECRET': {
    required: true,
    sensitive: true,
    description: 'NextAuth v5 Google OAuth 客户端密钥'
  },
  
  // NextAuth v4 兼容性变量
  'NEXTAUTH_SECRET': {
    required: true,
    sensitive: true,
    description: 'NextAuth v4 兼容性密钥'
  },
  'NEXTAUTH_URL': {
    required: true,
    sensitive: false,
    description: 'NextAuth v4 兼容性应用程序 URL'
  },
  'GOOGLE_CLIENT_ID': {
    required: true,
    sensitive: false,
    description: 'Google OAuth 客户端 ID（v4 兼容）'
  },
  'GOOGLE_CLIENT_SECRET': {
    required: true,
    sensitive: true,
    description: 'Google OAuth 客户端密钥（v4 兼容）'
  },
  
  // 公开环境变量
  'NEXT_PUBLIC_NEXTAUTH_URL': {
    required: true,
    sensitive: false,
    description: '公开的 NextAuth URL'
  },
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID': {
    required: true,
    sensitive: false,
    description: '公开的 Google 客户端 ID'
  },
  
  // Supabase 变量
  'NEXT_PUBLIC_SUPABASE_URL': {
    required: false,
    sensitive: false,
    description: 'Supabase 项目 URL'
  },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
    required: false,
    sensitive: false,
    description: 'Supabase 匿名密钥'
  },
  'SUPABASE_SERVICE_ROLE_KEY': {
    required: false,
    sensitive: true,
    description: 'Supabase 服务角色密钥'
  }
};

function checkEnvironmentVariables() {
  console.log('🔍 环境变量检查');
  console.log('================');
  
  const results = {
    missing: [],
    present: [],
    warnings: []
  };
  
  // 检查每个环境变量
  Object.entries(requiredEnvVars).forEach(([varName, config]) => {
    const value = process.env[varName];
    const status = {
      name: varName,
      present: !!value,
      required: config.required,
      sensitive: config.sensitive,
      description: config.description,
      value: config.sensitive ? (value ? '[已设置]' : '[未设置]') : value
    };
    
    if (config.required && !value) {
      results.missing.push(status);
    } else if (value) {
      results.present.push(status);
    }
  });
  
  // 显示结果
  console.log('\n✅ 已设置的环境变量:');
  results.present.forEach(env => {
    const icon = env.sensitive ? '🔐' : '📋';
    console.log(`   ${icon} ${env.name}: ${env.value}`);
    console.log(`      ${env.description}`);
  });
  
  if (results.missing.length > 0) {
    console.log('\n❌ 缺失的必需环境变量:');
    results.missing.forEach(env => {
      console.log(`   ⚠️  ${env.name}`);
      console.log(`      ${env.description}`);
    });
  }
  
  return results;
}

function validateEnvironmentValues() {
  console.log('\n🔍 环境变量值验证');
  console.log('==================');
  
  const validations = [];
  
  // 验证 URL 格式
  const urlVars = ['AUTH_URL', 'NEXTAUTH_URL', 'NEXT_PUBLIC_NEXTAUTH_URL'];
  urlVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      try {
        new URL(value);
        console.log(`   ✅ ${varName}: 有效的 URL 格式`);
      } catch (error) {
        console.log(`   ❌ ${varName}: 无效的 URL 格式 - ${value}`);
        validations.push({ var: varName, issue: 'Invalid URL format' });
      }
    }
  });
  
  // 验证 Google 客户端 ID 格式
  const googleIdVars = ['AUTH_GOOGLE_ID', 'GOOGLE_CLIENT_ID', 'NEXT_PUBLIC_GOOGLE_CLIENT_ID'];
  googleIdVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      if (value.includes('.apps.googleusercontent.com')) {
        console.log(`   ✅ ${varName}: 有效的 Google 客户端 ID 格式`);
      } else {
        console.log(`   ❌ ${varName}: 可能无效的 Google 客户端 ID 格式`);
        validations.push({ var: varName, issue: 'Invalid Google Client ID format' });
      }
    }
  });
  
  // 验证密钥长度
  const secretVars = ['AUTH_SECRET', 'NEXTAUTH_SECRET'];
  secretVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      if (value.length >= 32) {
        console.log(`   ✅ ${varName}: 密钥长度充足`);
      } else {
        console.log(`   ⚠️  ${varName}: 密钥长度可能不足（建议至少 32 字符）`);
        validations.push({ var: varName, issue: 'Secret too short' });
      }
    }
  });
  
  return validations;
}

function generateVercelEnvCommands() {
  console.log('\n🚀 Vercel 环境变量设置命令');
  console.log('============================');
  
  const sensitiveVars = Object.entries(requiredEnvVars)
    .filter(([_, config]) => config.sensitive && config.required)
    .map(([varName]) => varName);
  
  console.log('\n📋 在 Vercel Dashboard 中设置以下敏感环境变量：');
  console.log('   https://vercel.com/dashboard → 项目设置 → Environment Variables\n');
  
  sensitiveVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`   ${varName}=${value}`);
    } else {
      console.log(`   ${varName}=[请设置实际值]`);
    }
  });
  
  console.log('\n💡 或使用 Vercel CLI 命令：');
  sensitiveVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`   vercel env add ${varName} production`);
    }
  });
}

function showDeploymentChecklist() {
  console.log('\n📋 部署前检查清单');
  console.log('==================');
  
  console.log('\n1. ✅ 环境变量配置');
  console.log('   - 所有必需的环境变量已在 Vercel Dashboard 中设置');
  console.log('   - 敏感变量（密钥）未在代码中硬编码');
  
  console.log('\n2. ✅ Google Cloud Console 配置');
  console.log('   - OAuth 2.0 客户端已创建');
  console.log('   - 授权重定向 URI 包含: https://block-avoidance.iruns.xyz/api/auth/callback/google');
  console.log('   - 授权 JavaScript 来源包含: https://block-avoidance.iruns.xyz');
  
  console.log('\n3. ✅ NextAuth 配置');
  console.log('   - auth.ts 文件配置正确');
  console.log('   - trustHost: true 已设置');
  console.log('   - 调试模式仅在开发环境启用');
  
  console.log('\n4. ✅ Vercel 配置');
  console.log('   - vercel.json 文件配置正确');
  console.log('   - API 路由缓存控制已设置');
  console.log('   - 函数超时时间已配置');
}

// 主函数
function main() {
  console.log('🔧 NextAuth 生产环境配置检查');
  console.log('==============================\n');
  
  // 加载环境文件
  loadEnvFile();
  
  const envResults = checkEnvironmentVariables();
  const validationResults = validateEnvironmentValues();
  
  generateVercelEnvCommands();
  showDeploymentChecklist();
  
  console.log('\n📊 检查结果总结');
  console.log('================');
  console.log(`已设置变量: ${envResults.present.length}`);
  console.log(`缺失变量: ${envResults.missing.length}`);
  console.log(`验证问题: ${validationResults.length}`);
  
  if (envResults.missing.length === 0 && validationResults.length === 0) {
    console.log('\n🎉 环境变量配置完整！可以进行部署。');
  } else {
    console.log('\n⚠️  请先解决上述问题再进行部署。');
  }
  
  return {
    envResults,
    validationResults,
    ready: envResults.missing.length === 0 && validationResults.length === 0
  };
}

// 运行检查
if (require.main === module) {
  main();
}

module.exports = { checkEnvironmentVariables, validateEnvironmentValues };