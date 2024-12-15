import fetchInterceptor from "../interceptors";

export const queryGmgnSymbolListApi = async (params: API.queryGmgn, options: any) => {
    const res = await fetchInterceptor.get("/api/game", params, options);
    return res;
}