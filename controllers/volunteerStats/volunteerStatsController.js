import {
    getVolunteerStatsByUserId
} from "../../model/volunteerStats/volunteerStatsModel.js";

import { success, fail } from "../../utils/response.js";

export const getVolunteerStats = async (req, res) => {
    try {
        const useId = req.user.id;
        const stats = await getVolunteerStatsByUserId(userId);

        return success(res, stats, "조회 성공", 200);
    } catch (err) {
        console.error(err);
        return fail(res, err.message || "조회 실패", err.status || 500);
    }
};

