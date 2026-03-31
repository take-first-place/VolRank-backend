import express from "express";
const router = express.Router();

import {
    getList,
    getListPage
} from "../controllers/volunteer/volunteerController.js";

// GET /api/volunteers
router.get("/page", getListPage);

router.get("/", getList);

export default router;
