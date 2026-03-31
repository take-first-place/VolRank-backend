import express from "express";
const router = express.Router();

import {
    getList,
    getListPage
} from "../controllers/volunteer/volunteerController.js";

// GET /api/volunteers
router.get("/page", getListPage);   // 페이징
router.get("/", getList);   // 기본 전체 조회

export default router;
