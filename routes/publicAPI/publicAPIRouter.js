import express from "express";
import { syncVolunteers } from "../../controllers/publicAPI/publicAPIController.js";

const router = express.Router();

// 봉사활동 목록 동기화
// POST /api/volunteers/sync
router.post("/sync", syncVolunteers);

export default router;
