#!/usr/bin/env node

/**
 * Google OAuth 配置验证脚本
 * 用于验证 Google Cloud Console 中的 OAuth 配置是否正确
 */

const https = require('https');
const url = require('url');

// 配置信息
const config = {
  domain: 'https://block-avoidance.iruns.xyz',
  clientId: '140576991785-p7v28o6b96mhev7ttsones99oi6crcn3.apps.googleusercontent.com',
  expectedCallbackUrl: 'https://block-avoidance.iruns.xyz/api/auth/callback/google',
  expectedOrigin: 'https://block-avoidance.iruns.xyz'
};

console.log('🔍 Google OAuth 配置验证');
console.log('================================');

// 1. 验证域名可访问性
function checkDomainAccessibility() {
  return new Promise((resolve, reject) => {
    console.log('\n1. 检查域名可访问性...');
    
    const parsedUrl = url.parse(config.domain);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: '/',
      method: 'HEAD',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      console.log(`   ✅ 域名 ${config.domain} 可访问 (状态码: ${res.statusCode})`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`   ❌ 域名 ${config.domain} 不可访问: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`   ❌ 域名 ${config.domain} 访问超时`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// 2. 验证 NextAuth API 路由
function checkNextAuthRoute() {
  return new Promise((resolve, reject) => {
    console.log('\n2. 检查 NextAuth API 路由...');
    
    const authUrl = `${config.domain}/api/auth/providers`;
    const parsedUrl = url.parse(authUrl);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.path,
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'OAuth-Config-Verifier/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const providers = JSON.parse(data);
          if (providers.google) {
            console.log('   ✅ NextAuth Google 提供者配置正确');
            console.log(`   📋 Google 提供者 ID: ${providers.google.id}`);
            resolve(true);
          } else {
            console.log('   ❌ NextAuth Google 提供者未找到');
            console.log(`   📋 可用提供者: ${Object.keys(providers).join(', ')}`);
            resolve(false);
          }
        } catch (err) {
          console.log(`   ❌ NextAuth API 响应解析失败: ${err.message}`);
          console.log(`   📋 响应内容: ${data.substring(0, 200)}...`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ NextAuth API 路由不可访问: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('   ❌ NextAuth API 路由访问超时');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// 3. 显示配置检查清单
function showConfigurationChecklist() {
  console.log('\n3. Google Cloud Console 配置检查清单');
  console.log('=====================================');
  
  console.log('\n📋 请在 Google Cloud Console 中验证以下配置：');
  console.log('\n🔗 Authorized redirect URIs (必须包含):');
  console.log(`   ${config.expectedCallbackUrl}`);
  
  console.log('\n🌐 Authorized JavaScript origins (必须包含):');
  console.log(`   ${config.expectedOrigin}`);
  
  console.log('\n🔑 OAuth 2.0 客户端 ID:');
  console.log(`   ${config.clientId}`);
  
  console.log('\n⚠️  重要提醒:');
  console.log('   1. 确保回调 URL 完全匹配（包括 https:// 协议）');
  console.log('   2. 保存配置后可能需要几分钟才能生效');
  console.log('   3. 确保 OAuth 同意屏幕已配置并发布');
}

// 4. 显示环境变量检查
function showEnvironmentVariables() {
  console.log('\n4. Vercel 环境变量检查');
  console.log('========================');
  
  const requiredVars = [
    'AUTH_SECRET',
    'AUTH_URL',
    'AUTH_GOOGLE_ID', 
    'AUTH_GOOGLE_SECRET',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];
  
  console.log('\n📋 请在 Vercel Dashboard 中确保以下环境变量已设置：');
  requiredVars.forEach(varName => {
    console.log(`   ✓ ${varName}`);
  });
  
  console.log('\n🔗 Vercel Dashboard 链接:');
  console.log('   https://vercel.com/dashboard');
}

// 5. 显示调试建议
function showDebuggingTips() {
  console.log('\n5. 调试建议');
  console.log('=============');
  
  console.log('\n🔍 如果问题仍然存在，请检查：');
  console.log('   1. Vercel 函数日志: vercel logs --follow');
  console.log('   2. 浏览器开发者工具的网络标签');
  console.log('   3. Google Cloud Console 的 API 使用情况');
  console.log('   4. 确认域名 DNS 解析正确');
  
  console.log('\n🚀 测试 OAuth 流程：');
  console.log(`   1. 访问: ${config.domain}/auth/signin`);
  console.log('   2. 点击 Google 登录按钮');
  console.log('   3. 观察重定向过程是否正常');
}

// 主函数
async function main() {
  try {
    const domainAccessible = await checkDomainAccessibility();
    const nextAuthWorking = await checkNextAuthRoute();
    
    showConfigurationChecklist();
    showEnvironmentVariables();
    showDebuggingTips();
    
    console.log('\n📊 验证结果总结');
    console.log('================');
    console.log(`域名可访问性: ${domainAccessible ? '✅ 通过' : '❌ 失败'}`);
    console.log(`NextAuth API: ${nextAuthWorking ? '✅ 通过' : '❌ 失败'}`);
    
    if (domainAccessible && nextAuthWorking) {
      console.log('\n🎉 基础配置看起来正常！');
      console.log('   请按照上述检查清单验证 Google Cloud Console 配置。');
    } else {
      console.log('\n⚠️  发现问题，请先解决基础配置问题。');
    }
    
  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error.message);
  }
}

// 运行验证
if (require.main === module) {
  main();
}

module.exports = { checkDomainAccessibility, checkNextAuthRoute };