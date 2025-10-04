// 测试代理配置
require("./src/lib/fetch-patch.ts");

console.log("🧪 开始测试代理配置...");

async function testProxy() {
  try {
    console.log("📡 测试 Google OpenID 配置...");
    const response = await fetch("https://accounts.google.com/.well-known/openid_configuration");
    console.log("✅ 请求成功:", response.status, response.statusText);
    
    const data = await response.json();
    console.log("📋 OpenID 配置:", {
      issuer: data.issuer,
      authorization_endpoint: data.authorization_endpoint,
      token_endpoint: data.token_endpoint
    });
    
  } catch (error) {
    console.error("❌ 请求失败:", error.message);
  }
}

testProxy();