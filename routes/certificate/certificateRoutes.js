import express from "express";
import {
  uploadCertificate,
  getMyCertificates,
  getCertificatesByParticipation,
} from "../../controllers/certificate/certificateController.js";
import { certificateUpload } from "../../middleware/upload.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  certificateUpload.single("certificate"),
  uploadCertificate,
);

router.get("/my", authMiddleware, getMyCertificates);
router.get("/:participationId", authMiddleware, getCertificatesByParticipation);

export default router;
