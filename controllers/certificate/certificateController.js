import {
  uploadCertificate as uploadCertificateService,
  getMyCertificates as getMyCertificatesService,
  getCertificatesByParticipation as getCertificatesByParticipationService,
  getPendingCertificates as getPendingCertificatesService,
  reviewCertificate as reviewCertificateService,
} from "../../services/certificate/certificateService.js";
import { success } from "../../utils/response.js";
import asyncHandler from "../../middleware/asyncHandler.js";

// 인증서 업로드
export const uploadCertificate = asyncHandler(async (req, res) => {
  const participationId = Number(req.body.volunteerParticipationId);
  const userId = req.user.id;
  const file = req.file;

  const data = await uploadCertificateService({
    participationId,
    userId,
    file,
  });

  return success(res, data, "인증서 업로드 성공", 201);
});

// 내가 제출했던 모든 인증서 기록 조회
export const getMyCertificates = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = await getMyCertificatesService(userId);

  return success(res, data, "내 인증서 목록 조회 성공", 200);
});

// 관리자용 대기 중 인증서 목록 조회
export const getPendingCertificates = asyncHandler(async (req, res) => {
  const data = await getPendingCertificatesService();

  return success(res, data, "대기 중 인증서 목록 조회 성공", 200);
});

// 봉사활동별 제출한 인증서 목록 조회
export const getCertificatesByParticipation = asyncHandler(async (req, res) => {
  const participationId = Number(req.params.participationId);
  const userId = req.user.id;

  const data = await getCertificatesByParticipationService(
    participationId,
    userId,
  );

  return success(res, data, "참여 이력별 인증서 조회 성공", 200);
});

// 제출된 인증서 검토 처리
export const reviewCertificate = asyncHandler(async (req, res) => {
  const certificateId = Number(req.params.certificateId);
  const reviewerId = req.user.id;
  const { status, rejectedReason } = req.body;

  const data = await reviewCertificateService({
    certificateId,
    reviewerId,
    status,
    rejectedReason,
  });

  return success(res, data, "인증서 검토 처리 성공", 200);
});
