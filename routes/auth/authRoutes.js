import express from "express";
const router = express.Router();

import {
    login,
} from "../../controllers/auth/authController.js";

// POST /api/auth
router.post("/login", login);

export default router;