import { getNationalRanking, getRegionalRanking } from "../../services/rank/rankService.js";
import { success, fail } from "../../utils/response.js";

// GET /api/rank/national
export const getNational = async (req, res) => {
  try {
    const userId = req.user?.id ?? null; // 비로그인 허용

    const data = await getNationalRanking(userId);

    return success(
        res,
        data, 
        "전국 랭킹 조회 성공", 
        200
    );
  } catch (err) {
    console.error("전국 랭킹 조회 중 오류:", err);
    
    return fail(
        res, 
        err.message || "전국 랭킹 조회 실패", 
        err.status || 500
    );
  }
};

// GET /api/rank/region/:regionCode
export const getRegional = async (req, res) => {
  try {
    const { regionCode } = req.params;

    const userId = req.user?.id ?? null; // 비로그인 허용

    const data = await getRegionalRanking(regionCode, userId);

    return success(
        res, 
        data, 
        "지역 랭킹 조회 성공", 
        200
    );
  } catch (err) {
    console.error("지역 랭킹 조회 중 오류:", err);

    return fail(
        res, 
        err.message || "지역 랭킹 조회 실패", 
        err.status || 500
    );
  }
};
