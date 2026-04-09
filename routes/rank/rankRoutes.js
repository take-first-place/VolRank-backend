import express from "express";
import { getRegional, getNational } from "../../controllers/rank/rankController.js";
import { optionalAuth } from "../../middleware/authMiddleware.js";

const router = express.Router();

// optionalAuth : 토큰 있으면 req.user 주입, 없어도 통과
router.get(
    "/national", 
    optionalAuth, 
    getNational
);

router.get(
  "/region/:regionCode",
  optionalAuth,
  getRegional,
);

export default router;
