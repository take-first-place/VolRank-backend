import express from "express";
import {
  getSidoList,
  getSigunguList,
} from "../controllers/regionController.js";

const router = express.Router();

router.get("/sidos", getSidoList);
router.get("/sigungu", getSigunguList);

export default router;
