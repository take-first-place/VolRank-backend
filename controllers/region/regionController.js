import {
  findAllSidos,
  findChildRegionsByParentCode,
} from "../../model/region/regionModel.js";
import { success, fail } from "../../utils/response.js";

export const getSidoList = async (req, res) => {
  try {
    const sidoList = await findAllSidos();
    return success(res, sidoList, "시/도 목록 조회 성공");
  } catch (error) {
    console.error("시/도 목록 조회 실패:", error);
    return fail(res, "시/도 목록 조회 중 서버 오류가 발생했습니다.");
  }
};

export const getSigunguList = async (req, res) => {
  try {
    const { sidoCode } = req.query;

    if (!sidoCode || String(sidoCode).trim() === "") {
      return fail(res, "sidoCode는 필수 요청값입니다.", 400);
    }

    const sigunguList = await findChildRegionsByParentCode(
      String(sidoCode).trim(),
    );
    return success(res, sigunguList, "시/군/구 목록 조회 성공");
  } catch (error) {
    console.error("시/군/구 목록 조회 실패:", error);
    return fail(res, "시/군/구 목록 조회 중 서버 오류가 발생했습니다.");
  }
};
