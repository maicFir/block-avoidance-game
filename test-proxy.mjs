import { fetch, ProxyAgent } from "undici";

async function main() {
  const proxyUrl = process.env.HTTPS_PROXY || "http://127.0.0.1:7890";
  const agent = new ProxyAgent(proxyUrl);

  console.log("🔧 Using Proxy:", proxyUrl);

  const res = await fetch("https://accounts.google.com/.well-known/openid-configuration", {
    dispatcher: agent, // ✅ undici 要用 dispatcher
  });

  const data = await res.json();
  console.log("✅ Google response keys:", Object.keys(data));
}

main().catch(console.error);
