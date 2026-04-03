import express from "express";
import {
  getSidoList,
  getSigunguList,
} from "../../controllers/region/regionController.js";
import { syncExternalRegionMappings } from "../../controllers/region/externalRegionSyncController.js";
import { isAdmin } from "../../middleware/isAdmin.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/sidos", getSidoList);
router.get("/sigungu", getSigunguList);
router.post(
  "/sync/1365-region-mappings",
  authMiddleware,
  isAdmin,
  syncExternalRegionMappings,
);

export default router;
