import express from "express";
import {
  uploadCertificate,
  getMyCertificates,
  getCertificatesByParticipation,
  getAdminCertificates,
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

// 관리자 라우트는 동적 파라미터보다 먼저 선언
router.get("/admin", authMiddleware, isAdmin, getAdminCertificates);
router.get("/admin/pending", authMiddleware, isAdmin, getPendingCertificates);

router.get("/:participationId", authMiddleware, getCertificatesByParticipation);

router.patch(
  "/:certificateId/review",
  authMiddleware,
  isAdmin,
  reviewCertificate,
);

export default router;
