import asyncHandler from "../../middleware/asyncHandler.js";
import { success } from "../../utils/response.js";
import { sync1365RegionMappings } from "../../services/region/externalRegionSyncService.js";

export const syncExternalRegionMappings = asyncHandler(async (req, res) => {
  const result = await sync1365RegionMappings();

  return success(res, result, "1365 지역코드 동기화 성공");
});
