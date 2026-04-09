import express from "express";
const router = express.Router();

import {
  getVolunteers,
  registrationVolunteerPerformance,
  getVolunteerDetail
} from "../../controllers/volunteer/volunteerController.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

// GET /api/volunteers
router.get("/", getVolunteers); // 페이징 + 검색 + 필터 통합

// POST /api/register-volunteer
router.post(
  "/register-volunteer",
  authMiddleware,
  registrationVolunteerPerformance,
);

// GET /api/volunteers/:id
router.get("/:id", getVolunteerDetail); // 상세 조회 경로 추가

export default router;
