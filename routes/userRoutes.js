import express from "express";
const router = express.Router();

import { register } from "../controllers/user/userController.js";
import { registerValidator } from "../middleware/validator/userValidator.js";

// POST /api/users/register
router.post("/register", registerValidator, register);

export default router;
