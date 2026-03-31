import express from "express";
import {
  getSidoList,
  getSigunguList,
} from "../../controllers/region/regionController.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/sidos", authMiddleware, getSidoList);
router.get("/sigungu", authMiddleware, getSigunguList);

export default router;
