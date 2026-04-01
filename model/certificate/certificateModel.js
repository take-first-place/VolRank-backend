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

// 인증서 제출 기록 생성
// 불필요한 외곽 괄호를 제거하고 async 화살표 함수로 정의
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

  // 이제 await가 정상적으로 async 함수 내부에서 작동합니다.
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
