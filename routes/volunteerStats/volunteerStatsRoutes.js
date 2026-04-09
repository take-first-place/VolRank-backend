import express from "express";
const router = express.Router();

import {
    getVolunteerStats
} from "../../controllers/volunteerStats/volunteerStatsController.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

// GET /api/volunteer-stats
router.get('/', authMiddleware, getVolunteerStats); // 사용자별 봉사 실적 조회

export default router;

