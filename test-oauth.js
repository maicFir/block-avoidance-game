const { HttpsProxyAgent } = require('https-proxy-agent');
const https = require('https');
const { URL } = require('url');

// 设置代理
const proxyUrl = process.env.HTTPS_PROXY || 'http://127.0.0.1:7890';
const agent = new HttpsProxyAgent(proxyUrl);

console.log('🔍 测试 Google OAuth 配置...');
console.log('代理设置:', proxyUrl);

// 测试 Google OAuth 发现端点
function testGoogleOAuthDiscovery() {
  return new Promise((resolve, reject) => {
    const url = 'https://accounts.google.com/.well-known/openid-configuration';
    
    const options = {
      agent: agent,
      timeout: 30000,
    };

    const req = https.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const config = JSON.parse(data);
          console.log('✅ Google OAuth 发现端点连接成功');
          console.log('授权端点:', config.authorization_endpoint);
          console.log('令牌端点:', config.token_endpoint);
          resolve(config);
        } catch (error) {
          reject(new Error('解析响应失败: ' + error.message));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error('请求失败: ' + error.message));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.setTimeout(30000);
  });
}

// 测试 Google OAuth 授权端点
function testGoogleAuthEndpoint() {
  return new Promise((resolve, reject) => {
    const clientId = process.env.GOOGLE_CLIENT_ID || '442610918738-312aqd343k67l737gbj4t6nrtfv7epd3.apps.googleusercontent.com';
    const redirectUri = encodeURIComponent('http://localhost:3000/api/auth/callback/google');
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20profile%20email&state=test`;
    
    const url = new URL(authUrl);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'HEAD',
      agent: agent,
      timeout: 30000,
    };

    const req = https.request(options, (res) => {
      console.log('✅ Google OAuth 授权端点连接成功');
      console.log('状态码:', res.statusCode);
      console.log('重定向 URI 测试:', redirectUri);
      resolve(res.statusCode);
    });

    req.on('error', (error) => {
      reject(new Error('授权端点请求失败: ' + error.message));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('授权端点请求超时'));
    });

    req.setTimeout(30000);
    req.end();
  });
}

async function runTests() {
  try {
    console.log('\n🚀 开始测试...\n');
    
    // 测试 1: Google OAuth 发现端点
    console.log('1. 测试 Google OAuth 发现端点...');
    await testGoogleOAuthDiscovery();
    
    // 测试 2: Google OAuth 授权端点
    console.log('\n2. 测试 Google OAuth 授权端点...');
    await testGoogleAuthEndpoint();
    
    console.log('\n✅ 所有测试通过！');
    console.log('\n📋 建议检查项目:');
    console.log('1. 确保 Google Cloud Console 中的重定向 URI 包含: http://localhost:3000/api/auth/callback/google');
    console.log('2. 确保 OAuth 客户端状态为"已发布"');
    console.log('3. 检查客户端 ID 和密钥是否正确');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.log('\n🔧 可能的解决方案:');
    console.log('1. 检查网络代理设置');
    console.log('2. 验证 Google OAuth 客户端配置');
    console.log('3. 确认防火墙设置');
  }
}

runTests();