import express from "express";
const router = express.Router();

import {
    getVolunteers,
    getVolunteerDetail
} from "../../controllers/volunteer/volunteerController.js";

// GET /api/volunteers
router.get("/", getVolunteers);   // 페이징 + 검색 + 필터 통합

// GET /api/volunteers/:id
router.get("/:id", getVolunteerDetail); // 상세 조회 경로 추가

export default router;
