import asyncHandler from "../../middleware/asyncHandler.js";
import { success } from "../../utils/response.js";
import { syncLegalRegions } from "../../services/region/legalRegionSyncService.js";

export const syncLegalRegionCodes = asyncHandler(async (req, res) => {
  const result = await syncLegalRegions();

  return success(res, result, "법정동 지역 동기화 성공");
});
