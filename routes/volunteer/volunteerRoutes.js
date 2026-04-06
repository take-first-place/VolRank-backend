import express from "express";
const router = express.Router();

import {
    getVolunteers,
    registrationVolunteerPerformance
} from "../../controllers/volunteer/volunteerController.js";

// GET /api/volunteers
router.get("/", getVolunteers);   // 페이징 + 검색 + 필터 통합


// POST /api/register-volunteer
router.post("/register-volunteer", registrationVolunteerPerformance);


export default router;
