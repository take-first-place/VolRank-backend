import { fetchAndSaveVolunteers } from "../../services/publicAPI/publicAPIService.js";
import { success, fail } from "../../utils/response.js";

export const syncVolunteers = async (req, res) => {
  try {
    await fetchAndSaveVolunteers();

    return success(res, null, "봉사활동 동기화 성공", 200);
  } catch (err) {
    console.error("봉사활동 동기화 실패", err);
    return fail(res, err.message || "봉사활동 동기화 실패", err.status || 500);
  }
};
