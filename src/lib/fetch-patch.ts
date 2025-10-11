import { ProxyAgent } from "undici";

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

function resolveUrl(input: RequestInfo | URL): string {
  try {
    if (typeof input === "string") return input;
    if (input instanceof URL) return input.toString();
    const req = input as any;
    if (req && typeof req.url === "string") return req.url;
  } catch {}
  return "";
}

let supabaseHost: string | null = null;
try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    supabaseHost = new URL(supabaseUrl).hostname;
  }
} catch {}

function shouldBypassProxy(urlStr: string): boolean {
  if (!urlStr) return false;
  let host = "";
  try {
    host = new URL(urlStr).hostname;
  } catch {
    return false;
  }
  if (host === "localhost" || host === "127.0.0.1") return true;
  if (supabaseHost && host === supabaseHost) return true;
  if (host.endsWith(".supabase.co") || host === "supabase.com") return true;
  // 注意：不再绕过 Google 相关域名，确保它们走代理
  return false;
}

if (proxyUrl) {
  console.log("🔧 配置代理 fetch，代理地址:", proxyUrl);
  const agent = new ProxyAgent(proxyUrl);

  const originalFetch = global.fetch;

  global.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
    const url = resolveUrl(input);

    const bypass = shouldBypassProxy(url);
    if (bypass) {
      console.log("➡️ 绕过代理请求:", url);
      return originalFetch(input, init);
    }

    const options: any = {
      ...init,
      dispatcher: agent,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("⏰ 代理请求超时，取消请求:", url);
      controller.abort();
    }, 30000);

    options.signal = controller.signal;

    return originalFetch(input, options)
      .then((response) => {
        clearTimeout(timeoutId);
        console.log("✅ 通过代理请求成功:", url, response.status);
        return response;
      })
      .catch((error: any) => {
        clearTimeout(timeoutId);
        console.error("❌ 通过代理请求失败:", url, error?.message || error);
        throw error;
      });
  };

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
} else {
  console.log("⚠️ 未检测到代理配置，使用默认 fetch");
}
