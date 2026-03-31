import express from "express";
const router = express.Router();

import {
    getVolunteers
} from "../../controllers/volunteer/volunteerController.js";

// GET /api/volunteers
router.get("/", getVolunteers);   // 페이징 + 검색 + 필터 통합

export default router;
