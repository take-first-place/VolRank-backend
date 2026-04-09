import {
  findParticipationById,
  createVolunteerParticipation,
  findLastSubmissionNo,
  findLatestCertificateByParticipationId,
  findCertificateByParticipationIdAndFileHash,
  createCertificateSubmission,
  findCertificatesByUserId,
  findCertificatesByParticipationId,
  findCertificateById,
  findAdminCertificates,
  findPendingCertificates,
  reviewCertificate as reviewCertificateModel,
  updateParticipationAfterCertificateReview,
  resetParticipationAfterCertificateReject,
} from "../../model/certificate/certificateModel.js";
import { generateFileHash } from "../../utils/fileHash.js";
import { findById } from "../../model/user/userModel.js";

const validateNewParticipationPayload = (body) => {
  const {
    activityTitle,
    organizationName,
    place,
    startDate,
    endDate,
    requestedVolunteerHour,
  } = body;

  if (
    !activityTitle?.trim() ||
    !organizationName?.trim() ||
    !place?.trim() ||
    !startDate ||
    !endDate ||
    !requestedVolunteerHour
  ) {
    const error = new Error(
      "봉사활동 정보와 인증서 파일을 모두 입력해야 합니다.",
    );
    error.status = 400;
    throw error;
  }

  const parsedHour = Number(requestedVolunteerHour);

  if (!Number.isFinite(parsedHour) || parsedHour <= 0) {
    const error = new Error("요청 봉사시간은 0보다 큰 숫자여야 합니다.");
    error.status = 400;
    throw error;
  }

  return {
    activityTitle: activityTitle.trim(),
    organizationName: organizationName.trim(),
    place: place.trim(),
    startDate,
    endDate,
    requestedVolunteerHour: parsedHour,
  };
};

const resolveUserRegionCode = async (user) => {
  const regionCode = user?.region_code || user?.regionCode;

  if (regionCode) {
    return regionCode;
  }

  const dbUser = await findById(user.id);

  if (!dbUser?.region_code) {
    const error = new Error("사용자 지역 정보가 없습니다.");
    error.status = 400;
    throw error;
  }

  return dbUser.region_code;
};

const uploadToExistingParticipation = async ({
  participationId,
  userId,
  file,
}) => {
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

export const uploadCertificate = async ({ user, file, body }) => {
  if (!file) {
    const error = new Error("업로드할 인증서가 없습니다.");
    error.status = 400;
    throw error;
  }

  const participationId = Number(body?.volunteerParticipationId);

  if (Number.isInteger(participationId) && participationId > 0) {
    return await uploadToExistingParticipation({
      participationId,
      userId: user.id,
      file,
    });
  }

  const newParticipationPayload = validateNewParticipationPayload(body);
  const regionCode = await resolveUserRegionCode(user);

  const createdParticipationId = await createVolunteerParticipation({
    userId: user.id,
    regionCode,
    ...newParticipationPayload,
  });

  return await uploadToExistingParticipation({
    participationId: createdParticipationId,
    userId: user.id,
    file,
  });
};

// 아래 나머지 함수들은 기존 그대로 유지
export const getMyCertificates = async (userId) => {
  return await findCertificatesByUserId(userId);
};

export const getAdminCertificates = async () => {
  return await findAdminCertificates();
};

export const getPendingCertificates = async () => {
  return await findPendingCertificates();
};

export const getCertificatesByParticipation = async (
  participationId,
  userId,
) => {
  if (!Number.isInteger(participationId)) {
    const error = new Error("유효하지 않은 참여 이력 ID입니다.");
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
    const error = new Error("본인의 참여 이력만 조회할 수 있습니다.");
    error.status = 403;
    throw error;
  }

  return await findCertificatesByParticipationId(participationId);
};

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

  const participation = await findParticipationById(
    certificate.volunteer_participation_id,
  );

  if (!participation) {
    const error = new Error("참여 이력을 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  await reviewCertificateModel({
    certificateId,
    status,
    reviewerId,
    rejectedReason: status === "REJECTED" ? rejectedReason.trim() : null,
  });

  if (status === "APPROVED") {
    await updateParticipationAfterCertificateReview({
      participationId: certificate.volunteer_participation_id,
      participationStatus: "APPROVED",
      approvedVolunteerHour: participation.requested_volunteer_hour,
    });
  }

  if (status === "REJECTED") {
    await resetParticipationAfterCertificateReject({
      participationId: certificate.volunteer_participation_id,
    });
  }

  return {
    certificateId,
    status,
    reviewerId,
    rejectedReason: status === "REJECTED" ? rejectedReason.trim() : null,
  };
};
