const https = require('https');
const { URL } = require('url');
const fs = require('fs');

// 手动读取 .env.local 文件
function loadEnvFile() {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key] = value;
        }
      }
    }
  } catch (error) {
    console.log('⚠️  无法读取 .env.local 文件:', error.message);
  }
}

loadEnvFile();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback/google';

console.log('🔍 Google OAuth 配置测试');
console.log('========================');
console.log('Client ID:', CLIENT_ID ? `${CLIENT_ID.substring(0, 20)}...` : '❌ 未设置');
console.log('Client Secret:', CLIENT_SECRET ? `${CLIENT_SECRET.substring(0, 10)}...` : '❌ 未设置');
console.log('Redirect URI:', REDIRECT_URI);
console.log('');

// 测试 Google OAuth 发现端点
function testGoogleDiscovery() {
  return new Promise((resolve, reject) => {
    const url = 'https://accounts.google.com/.well-known/openid_configuration';
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const config = JSON.parse(data);
          console.log('✅ Google OAuth 发现端点正常');
          console.log('   授权端点:', config.authorization_endpoint);
          console.log('   令牌端点:', config.token_endpoint);
          resolve(config);
        } catch (error) {
          console.log('❌ 解析 Google OAuth 配置失败:', error.message);
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.log('❌ 连接 Google OAuth 发现端点失败:', error.message);
      reject(error);
    });
  });
}

// 测试授权URL构建
function testAuthorizationUrl() {
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', 'test-state');
  
  console.log('🔗 生成的授权URL:');
  console.log(authUrl.toString());
  console.log('');
  
  return authUrl.toString();
}

// 主测试函数
async function runTests() {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.log('❌ 缺少必要的环境变量');
      console.log('请确保 .env.local 文件包含:');
      console.log('- GOOGLE_CLIENT_ID');
      console.log('- GOOGLE_CLIENT_SECRET');
      return;
    }
    
    await testGoogleDiscovery();
    console.log('');
    testAuthorizationUrl();
    
    console.log('📋 故障排除建议:');
    console.log('================');
    console.log('1. 检查 Google Cloud Console 中的授权重定向 URI:');
    console.log('   - 应该包含: http://localhost:3000/api/auth/callback/google');
    console.log('   - 确保没有尾随斜杠');
    console.log('');
    console.log('2. 检查 OAuth 应用状态:');
    console.log('   - 确保应用已发布或在测试用户列表中');
    console.log('   - 检查应用是否被暂停');
    console.log('');
    console.log('3. 验证客户端 ID 和密钥:');
    console.log('   - 确保从正确的 OAuth 2.0 客户端复制');
    console.log('   - 检查是否有特殊字符或空格');
    console.log('');
    console.log('4. 网络问题:');
    console.log('   - 如果使用代理，请暂时禁用');
    console.log('   - 检查防火墙设置');
    
  } catch (error) {
    console.log('❌ 测试失败:', error.message);
  }
}

runTests();