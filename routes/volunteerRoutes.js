import express from "express";
const router = express.Router();

import {
    getList
} from "../controllers/volunteer/volunteerController.js";

router.get("/", getList);

export default router;