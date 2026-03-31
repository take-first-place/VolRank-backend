import express from "express";
const router = express.Router();

import {
  register,
  sendCode,
  verifyingCode,
} from "../../controllers/user/userController.js";
import { registerValidator } from "../../middleware/validator/userValidator.js";

// POST /api/users
router.post("/send-code", sendCode); // 코드 발송
router.post("/verify-code", verifyingCode); // 코드 검증
router.post("/register", registerValidator, register); // 회원가입

export default router;
