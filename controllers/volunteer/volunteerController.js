import { findVolunteers, createVolunteerPerformance } from "../../model/volunteer/volunteerModel.js";

import { success, fail } from "../../utils/response.js";

export const registrationVolunteerPerformance = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      activityTitle,
      organizationName,
      regionCode,
      place,
      startDate,
      endDate,
    } = req.body;

    const result = await createVolunteerPerformance({
      userId,
      activityTitle,
      organizationName,
      regionCode,
      place,
      startDate,
      endDate,
    });

    return success(
      res, 
      "봉사 실적 등록 성공", 
      { insertId: result.insertId }
    );
    
  } catch (err) {
    console.error("등록 실패", err);
    return fail(
      res, 
      err.message || "등록 실패", 
      err.status || 500
    );
  }
};

export const getVolunteers = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const size = Math.min(50, Number(req.query.size) || 5);

    const result = await findVolunteers({
      page,
      size,
      ...req.query,
    });

    return success(res, result, "조회 성공", 200);
  } catch (err) {
    console.error("조회 실패", err);
    return fail(res, err.message || "조회 실패", err.status || 500);
  }
};
