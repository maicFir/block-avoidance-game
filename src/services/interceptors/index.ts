/**
 * @description 原生fetch封装，接口拦截
 * @author maicFir
 */
type RequestInterceptor = (config: {
    url: string;
    options: RequestInit;
  }) => Promise<{ url: string; options: RequestInit }>;
  
  type ResponseInterceptor = (response: Response) => Promise<any>;
  
  class FetchInterceptor {
    private baseURL: string;
    private requestInterceptors: RequestInterceptor[] = [];
    private responseInterceptors: ResponseInterceptor[] = [];
  
    constructor(baseURL: string = "") {
      this.baseURL = baseURL;
    }
  
    // 添加请求拦截器
    addRequestInterceptor(interceptor: RequestInterceptor) {
      this.requestInterceptors.push(interceptor);
    }
  
    // 添加响应拦截器
    addResponseInterceptor(interceptor: ResponseInterceptor) {
      this.responseInterceptors.push(interceptor);
    }
  
    // 执行拦截器链
    private async executeInterceptors<T>(
        interceptors: ((data: T) => Promise<T>)[],
        data: T
      ): Promise<T> {
        for (const interceptor of interceptors) {
          data = await interceptor(data);
        }
        return data;
      }
  
    // 封装fetch
    async request<T = any>(url: string, options: RequestInit = {}): Promise<T> {
      // 执行请求拦截器
      const { url: finalUrl, options: finalOptions } =
        await this.executeInterceptors(this.requestInterceptors, { url, options });
  
      // 发起请求
      const response = await fetch(`${this.baseURL}${finalUrl}`, finalOptions);
  
      // 执行响应拦截器
      return this.executeInterceptors<any>(this.responseInterceptors, response);
    }
  
    // GET 请求
    async get<T = any>(
      url: string,
      params: Record<string, string | number> = {},
      options: RequestInit = {}
    ): Promise<T> {
      const queryString = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      ).toString();
      const fullUrl = queryString ? `${url}?${queryString}` : url;
      return this.request<T>(fullUrl, { ...options, method: "GET" });
    }
  
    // POST 请求
    async post<T = any>(
      url: string,
      body: Record<string, any> = {},
      options: RequestInit = {}
    ): Promise<T> {
      return this.request<T>(url, {
        ...options,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        body: JSON.stringify(body),
      });
    }
  }
  
  // 实例化拦截器
  const fetchInterceptor = new FetchInterceptor("");
  
  // 添加请求拦截器
  fetchInterceptor.addRequestInterceptor(async ({ url, options }) => {
    console.log("请求拦截器：", url, options);
    options.headers = {
      ...options.headers,
    };
    return { url, options };
  });
  
  // 添加响应拦截器
  fetchInterceptor.addResponseInterceptor(async (response) => {
    console.log("响应拦截器：", response);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "请求失败");
    }
    return response.json(); // 默认返回解析后的 JSON 数据
  });
  
  export default fetchInterceptor;  