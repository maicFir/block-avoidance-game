import { ProxyAgent } from "undici";

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

// 辅助方法：安全地解析请求 URL
function resolveUrl(input: RequestInfo | URL): string {
  try {
    if (typeof input === "string") return input;
    if (input instanceof URL) return input.toString();
    // Request 对象
    const req = input as any;
    if (req && typeof req.url === "string") return req.url;
  } catch {}
  return "";
}

// 解析 Supabase 主机名（如有配置）
let supabaseHost: string | null = null;
try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    supabaseHost = new URL(supabaseUrl).hostname;
  }
} catch {}

// 判断是否应当绕过代理
function shouldBypassProxy(urlStr: string): boolean {
  if (!urlStr) return false;
  let host = "";
  try {
    host = new URL(urlStr).hostname;
  } catch {
    // 无法解析 URL 时默认不绕过（继续走代理），以保证行为一致
    return false;
  }
  if (host === "localhost" || host === "127.0.0.1") return true;
  if (supabaseHost && host === supabaseHost) return true;
  if (host.endsWith(".supabase.co") || host === "supabase.com") return true;
  if (host === "accounts.google.com") return true;
  if (host.endsWith(".googleapis.com")) return true;
  if (host.endsWith(".googleusercontent.com")) return true;
  return false;
}

if (proxyUrl) {
  console.log("🔧 配置代理 fetch，代理地址:", proxyUrl);
  const agent = new ProxyAgent(proxyUrl);

  // 保存原始 fetch
  const originalFetch = global.fetch;

  // 覆盖 global fetch
  global.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
    const url = resolveUrl(input);

    if (shouldBypassProxy(url)) {
      // 白名单域名：不使用代理
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
        // 仅在非白名单的代理请求时记录成功日志
        console.log("✅ 代理请求成功:", url, response.status);
        return response;
      })
      .catch((error: any) => {
        clearTimeout(timeoutId);
        console.error("❌ 代理请求失败:", url, error?.message || error);
        throw error;
      });
  };

  // 同时设置环境变量，确保其他 HTTP 客户端也使用代理
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // 忽略 SSL 证书错误
} else {
  console.log("⚠️ 未检测到代理配置，使用默认 fetch");
}
