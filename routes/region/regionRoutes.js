import express from "express";
import { isAdmin } from "../../middleware/isAdmin.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import {
  getSidoList,
  getSigunguList,
} from "../../controllers/region/regionController.js";
import { syncExternalRegionMappings } from "../../controllers/region/externalRegionSyncController.js";
import { syncLegalRegionCodes } from "../../controllers/region/legalRegionSyncController.js";

const router = express.Router();

router.get("/sidos", getSidoList);
router.get("/sigungu", getSigunguList);
router.post(
  "/sync/legal-regions",
  authMiddleware,
  isAdmin,
  syncLegalRegionCodes,
);
router.post(
  "/sync/1365-region-mappings",
  authMiddleware,
  isAdmin,
  syncExternalRegionMappings,
);

export default router;
