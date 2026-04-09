import pool from "../../config/db.js";

// 특정 참여 기록 조회
export const findParticipationById = async (participationId) => {
  const sql = `
    SELECT 
      id,
      user_id,
      activity_title,
      organization_name,
      participation_status,
      requested_volunteer_hour,
      approved_volunteer_hour
    FROM volunteer_participation
    WHERE id = ?
  `;
  const [rows] = await pool.query(sql, [participationId]);
  return rows[0];
};

// 마지막 제출 번호 조회
export const findLastSubmissionNo = async (participationId) => {
  const sql = `
    SELECT MAX(submission_no) AS lastSubmissionNo
    FROM certificate_submission
    WHERE volunteer_participation_id = ?
  `;
  const [rows] = await pool.query(sql, [participationId]);
  return rows[0]?.lastSubmissionNo ?? 0;
};

// 최신 인증서 제출 내역 조회
export const findLatestCertificateByParticipationId = async (
  participationId,
) => {
  const sql = `
    SELECT
      id,
      volunteer_participation_id,
      file_url,
      file_hash,
      status,
      submission_no,
      submitted_at,
      reviewed_at,
      reviewer_id,
      rejected_reason
    FROM certificate_submission
    WHERE volunteer_participation_id = ?
    ORDER BY submission_no DESC
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [participationId]);
  return rows[0];
};

// 동일 참여 이력에 동일 파일 해시가 이미 있는지 조회
export const findCertificateByParticipationIdAndFileHash = async ({
  participationId,
  fileHash,
}) => {
  const sql = `
    SELECT
      id,
      volunteer_participation_id,
      file_hash,
      submission_no,
      status
    FROM certificate_submission
    WHERE volunteer_participation_id = ?
      AND file_hash = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [participationId, fileHash]);
  return rows[0];
};

// 인증서 제출 기록 생성
export const createCertificateSubmission = async ({
  participationId,
  fileUrl,
  fileHash,
  submissionNo,
}) => {
  const sql = `
    INSERT INTO certificate_submission (
      volunteer_participation_id,
      file_url,
      file_hash,
      status,
      submission_no,
      submitted_at
    )
    VALUES (?, ?, ?, 'PENDING', ?, NOW())
  `;

  const [result] = await pool.query(sql, [
    participationId,
    fileUrl,
    fileHash,
    submissionNo,
  ]);

  return result.insertId;
};

// 사용자별 인증서 목록 조회
export const findCertificatesByUserId = async (userId) => {
  const sql = `
    SELECT
      cs.id,
      cs.volunteer_participation_id,
      cs.file_url,
      cs.file_hash,
      cs.status,
      cs.submission_no,
      cs.submitted_at,
      cs.reviewed_at,
      cs.rejected_reason,
      vp.user_id,
      vp.activity_title,
      vp.organization_name,
      vp.start_date,
      vp.end_date
    FROM certificate_submission cs
    INNER JOIN volunteer_participation vp
      ON cs.volunteer_participation_id = vp.id
    WHERE vp.user_id = ?
    ORDER BY cs.submitted_at DESC, cs.submission_no DESC
  `;
  const [rows] = await pool.query(sql, [userId]);
  return rows;
};

// 참여 기록별 인증서 목록 조회
export const findCertificatesByParticipationId = async (participationId) => {
  const sql = `
    SELECT
      id,
      volunteer_participation_id,
      file_url,
      file_hash,
      status,
      submission_no,
      submitted_at,
      reviewed_at,
      reviewer_id,
      rejected_reason
    FROM certificate_submission
    WHERE volunteer_participation_id = ?
    ORDER BY submission_no DESC
  `;
  const [rows] = await pool.query(sql, [participationId]);
  return rows;
};

// 관리자용 대기 중 인증서 목록 조회
export const findPendingCertificates = async () => {
  const sql = `
    SELECT
      cs.id,
      cs.volunteer_participation_id,
      cs.file_url,
      cs.file_hash,
      cs.status,
      cs.submission_no,
      cs.submitted_at,
      vp.user_id,
      vp.activity_title,
      vp.organization_name,
      vp.start_date,
      vp.end_date,
      vp.requested_volunteer_hour,
      u.nickname,
      u.email
    FROM certificate_submission cs
    INNER JOIN volunteer_participation vp
      ON cs.volunteer_participation_id = vp.id
    INNER JOIN users u
      ON vp.user_id = u.id
    WHERE cs.status = 'PENDING'
    ORDER BY cs.submitted_at ASC, cs.submission_no ASC
  `;

  const [rows] = await pool.query(sql);
  return rows;
};

// 인증서 ID로 상세 조회
export const findCertificateById = async (certificateId) => {
  const sql = `
    SELECT
      cs.id,
      cs.volunteer_participation_id,
      cs.status,
      cs.submission_no,
      vp.user_id
    FROM certificate_submission cs
    INNER JOIN volunteer_participation vp
      ON cs.volunteer_participation_id = vp.id
    WHERE cs.id = ?
  `;
  const [rows] = await pool.query(sql, [certificateId]);
  return rows[0];
};

// 인증서 검토 결과 업데이트 (승인/반려)
export const reviewCertificate = async ({
  certificateId,
  status,
  reviewerId,
  rejectedReason,
}) => {
  const sql = `
    UPDATE certificate_submission
    SET
      status = ?,
      reviewer_id = ?,
      reviewed_at = NOW(),
      rejected_reason = ?
    WHERE id = ?
  `;

  const [result] = await pool.query(sql, [
    status,
    reviewerId,
    rejectedReason,
    certificateId,
  ]);

  return result;
};
