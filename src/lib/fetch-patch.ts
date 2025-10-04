import { ProxyAgent } from "undici";

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
if (proxyUrl) {
  console.log("🔧 配置代理 fetch，代理地址:", proxyUrl);
  const agent = new ProxyAgent(proxyUrl); 
  
  // 保存原始 fetch
  const originalFetch = global.fetch;
  
  // 覆盖 global fetch
  global.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = input.toString();
    console.log("🌐 通过代理请求:", url);
    
    // 只对外部请求使用代理
    if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
      return originalFetch(input, init);
    }
    
    // 创建新的选项对象，添加代理和超时
    const options: any = {
      ...init,
      dispatcher: agent,
    };
    
    // 强制设置 30 秒超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("⏰ 请求超时，取消请求:", url);
      controller.abort();
    }, 30000);
    
    options.signal = controller.signal;
    
    return originalFetch(input, options)
      .then((response) => {
        clearTimeout(timeoutId);
        console.log("✅ 代理请求成功:", url, response.status);
        return response;
      })
      .catch((error: any) => {
        clearTimeout(timeoutId);
        console.error("❌ 代理请求失败:", url, error.message);
        throw error;
      });
  };
  
  // 同时设置环境变量，确保其他 HTTP 客户端也使用代理
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // 忽略 SSL 证书错误
  
} else {
  console.log("⚠️ 未检测到代理配置，使用默认 fetch");
}
