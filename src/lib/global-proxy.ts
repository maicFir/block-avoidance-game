// 全局代理配置 - 在应用启动时尽早执行，但不强制设置默认代理
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';

// 仅当外部环境已设置代理时，才同步到其他常见环境变量名
if (proxyUrl) {
  process.env.HTTPS_PROXY = proxyUrl;
  process.env.HTTP_PROXY = proxyUrl;
  process.env.https_proxy = proxyUrl;
  process.env.http_proxy = proxyUrl;
  console.log('🌐 使用现有代理配置:', proxyUrl);
} else {
  console.log('🌐 未检测到代理配置(HTTPS_PROXY/HTTP_PROXY)，默认直连网络');
}

// 导出代理配置供其他模块使用
export { proxyUrl };