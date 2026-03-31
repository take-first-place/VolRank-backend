import express from "express";
const router = express.Router();

import { loginController } from "../../controllers/auth/authController.js";

// POST /api/auth
router.post("/login", loginController);

export default router;
