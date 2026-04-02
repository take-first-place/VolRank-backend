import express from "express";
import {
  uploadCertificate,
  getMyCertificates,
  getCertificatesByParticipation,
  getPendingCertificates,
  reviewCertificate,
} from "../../controllers/certificate/certificateController.js";
import { certificateUpload } from "../../middleware/upload.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { isAdmin } from "../../middleware/isAdmin.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  certificateUpload.single("certificate"),
  uploadCertificate,
);

router.get("/my", authMiddleware, getMyCertificates);
router.get("/admin/pending", authMiddleware, isAdmin, getPendingCertificates);
router.get("/:participationId", authMiddleware, getCertificatesByParticipation);
router.patch(
  "/:certificateId/review",
  authMiddleware,
  isAdmin,
  reviewCertificate,
);

export default router;
