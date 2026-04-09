import {
  findAllSidos,
  findChildRegionsByParentCode,
} from "../../model/region/regionModel.js";
import asyncHandler from "../../middleware/asyncHandler.js";
import { success, fail } from "../../utils/response.js";

export const getSidoList = asyncHandler(async (req, res) => {
  const sidoList = await findAllSidos();
  return success(res, sidoList, "시/도 목록 조회 성공");
});

export const getSigunguList = asyncHandler(async (req, res) => {
  const { sidoCode } = req.query;

  if (!sidoCode || String(sidoCode).trim() === "") {
    return fail(res, "sidoCode는 필수 요청값입니다.", 400);
  }

  const sigunguList = await findChildRegionsByParentCode(
    String(sidoCode).trim(),
  );

  return success(res, sigunguList, "시/군/구 목록 조회 성공");
});
