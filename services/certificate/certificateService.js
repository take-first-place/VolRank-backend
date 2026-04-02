import {
  findParticipationById,
  findLastSubmissionNo,
  findLatestCertificateByParticipationId,
  findCertificateByParticipationIdAndFileHash,
  createCertificateSubmission,
  findCertificatesByUserId,
  findCertificatesByParticipationId,
  findCertificateById,
  findPendingCertificates,
  reviewCertificate as reviewCertificateModel,
} from "../../model/certificate/certificateModel.js";
import { generateFileHash } from "../../utils/fileHash.js";

// 인증서 업로드
export const uploadCertificate = async ({ participationId, userId, file }) => {
  if (!file) {
    const error = new Error("업로드할 인증서가 없습니다.");
    error.status = 400;
    throw error;
  }

  const participation = await findParticipationById(participationId);

  if (!participation) {
    const error = new Error("참여 이력을 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  if (participation.user_id !== userId) {
    const error = new Error(
      "본인의 참여 이력에만 인증서를 업로드할 수 있습니다.",
    );
    error.status = 403;
    throw error;
  }

  const latestCertificate =
    await findLatestCertificateByParticipationId(participationId);

  if (latestCertificate?.status === "PENDING") {
    const error = new Error(
      "현재 검토 중인 인증서가 있어 재제출할 수 없습니다.",
    );
    error.status = 409;
    throw error;
  }

  if (latestCertificate?.status === "APPROVED") {
    const error = new Error(
      "이미 승인된 인증서가 있어 다시 제출할 수 없습니다.",
    );
    error.status = 409;
    throw error;
  }

  const fileHash = await generateFileHash(file.path);

  if (latestCertificate?.status === "REJECTED") {
    const duplicatedCertificate =
      await findCertificateByParticipationIdAndFileHash({
        participationId,
        fileHash,
      });

    if (duplicatedCertificate) {
      const error = new Error(
        "이전에 제출한 인증서와 동일한 파일은 재제출할 수 없습니다.",
      );
      error.status = 409;
      throw error;
    }
  }

  const lastSubmissionNo = await findLastSubmissionNo(participationId);
  const nextSubmissionNo = lastSubmissionNo + 1;
  const fileUrl = `/uploads/certificates/${file.filename}`;

  const certificateId = await createCertificateSubmission({
    participationId,
    fileUrl,
    fileHash,
    submissionNo: nextSubmissionNo,
  });

  return {
    certificateId,
    participationId,
    submissionNo: nextSubmissionNo,
    fileUrl,
    fileHash,
    status: "PENDING",
  };
};

// 내 인증서 목록 조회 서비스
export const getMyCertificates = async (userId) => {
  return await findCertificatesByUserId(userId);
};

// 관리자용 대기 중 인증서 목록 조회
export const getPendingCertificates = async () => {
  return await findPendingCertificates();
};

// 참여 이력별 인증서 목록 조회 서비스
export const getCertificatesByParticipation = async (
  participationId,
  userId,
) => {
  const participation = await findParticipationById(participationId);

  if (!participation) {
    const error = new Error("참여 이력을 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  if (participation.user_id !== userId) {
    const error = new Error("본인의 참여 이력만 조회할 수 있습니다.");
    error.status = 403;
    throw error;
  }

  return await findCertificatesByParticipationId(participationId);
};

// 관리자 인증서 검토 서비스 (승인/반려)
export const reviewCertificate = async ({
  certificateId,
  reviewerId,
  status,
  rejectedReason,
}) => {
  const certificate = await findCertificateById(certificateId);

  if (!certificate) {
    const error = new Error("인증서 제출 내역을 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  if (certificate.status !== "PENDING") {
    const error = new Error("검토 대기 상태의 인증서만 처리할 수 있습니다.");
    error.status = 409;
    throw error;
  }

  if (!["APPROVED", "REJECTED"].includes(status)) {
    const error = new Error("status는 APPROVED 또는 REJECTED만 가능합니다.");
    error.status = 400;
    throw error;
  }

  if (status === "REJECTED" && !rejectedReason?.trim()) {
    const error = new Error("반려 시 rejectedReason은 필수입니다.");
    error.status = 400;
    throw error;
  }

  await reviewCertificateModel({
    certificateId,
    status,
    reviewerId,
    rejectedReason: status === "REJECTED" ? rejectedReason.trim() : null,
  });

  return {
    certificateId,
    status,
    reviewerId,
    rejectedReason: status === "REJECTED" ? rejectedReason.trim() : null,
  };
};
