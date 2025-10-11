import fetchInterceptor from "../interceptors";

export const queryGmgnSymbolListApi = async (params: API.queryGmgn, options: any) => {
    const res = await fetchInterceptor.get("/api/game", params, options);
    return res;
}

export const saveGameSesionApi = async (gameData: {
  score: number;
  duration: number;
  level_reached?: number;
  coins_collected?: number;
  obstacles_avoided?: number;
}) => {
    const res = await fetchInterceptor.post("/api/game/save-session", gameData);
    return res;
}

export const getUserStatsApi = async () => {
    const res = await fetchInterceptor.get("/api/user/stats");
    return res;
}

/**
 * 排行榜
 */

export const getLeaderBoardApi = async (limit = 10) => {
    const res = await fetchInterceptor.get(`/api/leaderboard?limit=${limit}`);
    return res;
}

