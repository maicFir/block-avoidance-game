const { fetch, ProxyAgent } = require('undici');
const fs = require('fs');
const path = require('path');

// 读取环境变量
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
    envVars[key.trim()] = value;
  }
});

const proxyUrl = envVars.HTTPS_PROXY || envVars.HTTP_PROXY;
const clientId = envVars.GOOGLE_CLIENT_ID;
const clientSecret = envVars.GOOGLE_CLIENT_SECRET;

console.log('🔍 OAuth 详细测试');
console.log('代理URL:', proxyUrl);
console.log('Client ID:', clientId ? `${clientId.substring(0, 10)}...` : '未设置');
console.log('Client Secret:', clientSecret ? '已设置' : '未设置');

async function testOAuthEndpoints() {
  const agent = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;
  
  const fetchOptions = agent ? { dispatcher: agent } : {};
  
  console.log('\n🌐 测试 Google OAuth 端点...');
  
  try {
    // 1. 测试 Google 发现端点
    console.log('1. 测试 Google OpenID 配置...');
    const discoveryResponse = await fetch(
      'https://accounts.google.com/.well-known/openid_configuration',
      fetchOptions
    );
    console.log('   状态:', discoveryResponse.status);
    
    if (discoveryResponse.ok) {
      const discoveryData = await discoveryResponse.json();
      console.log('   授权端点:', discoveryData.authorization_endpoint);
      console.log('   令牌端点:', discoveryData.token_endpoint);
      
      // 2. 测试授权端点连接
      console.log('\n2. 测试授权端点连接...');
      const authResponse = await fetch(discoveryData.authorization_endpoint, {
        method: 'HEAD',
        ...fetchOptions
      });
      console.log('   授权端点状态:', authResponse.status);
      
      // 3. 测试令牌端点连接
      console.log('\n3. 测试令牌端点连接...');
      const tokenResponse = await fetch(discoveryData.token_endpoint, {
        method: 'HEAD',
        ...fetchOptions
      });
      console.log('   令牌端点状态:', tokenResponse.status);
      
    } else {
      console.log('   错误:', await discoveryResponse.text());
    }
    
  } catch (error) {
    console.error('❌ 网络错误:', error.message);
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.log('\n💡 建议:');
      console.log('1. 检查代理服务器是否运行');
      console.log('2. 验证代理配置是否正确');
      console.log('3. 尝试直接连接（禁用代理）');
    }
  }
}

async function testGoogleClientCredentials() {
  console.log('\n🔑 测试 Google 客户端凭据...');
  
  if (!clientId || !clientSecret) {
    console.log('❌ 客户端凭据不完整');
    return;
  }
  
  const agent = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;
  const fetchOptions = agent ? { dispatcher: agent } : {};
  
  try {
    // 构造一个简单的 OAuth 请求来验证凭据
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: 'http://localhost:3000/api/auth/callback/google',
      response_type: 'code',
      scope: 'openid email profile',
      state: 'test'
    });
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    console.log('构造的授权URL:', authUrl.substring(0, 100) + '...');
    
    // 测试是否能访问授权页面
    const response = await fetch(authUrl, {
      method: 'HEAD',
      ...fetchOptions
    });
    
    console.log('授权页面状态:', response.status);
    
    if (response.status === 200) {
      console.log('✅ 客户端凭据验证通过');
    } else {
      console.log('⚠️  客户端凭据可能有问题，状态码:', response.status);
    }
    
  } catch (error) {
    console.error('❌ 凭据测试失败:', error.message);
  }
}

// 运行测试
async function runAllTests() {
  await testOAuthEndpoints();
  await testGoogleClientCredentials();
  
  console.log('\n📋 排查建议:');
  console.log('1. 确保代理服务器正在运行');
  console.log('2. 检查 Google Cloud Console 中的 OAuth 配置');
  console.log('3. 验证回调 URL: http://localhost:3000/api/auth/callback/google');
  console.log('4. 确认 OAuth 应用状态（发布状态或测试用户）');
}

runAllTests().catch(console.error);