import pool from "../../config/db.js";

// 특정 참여 기록 조회
export const findParticipationById = async (participationId) => {
  const sql = `
    SELECT 
      id, user_id, 
      volunteer_id, 
      participation_status
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
      submitted_at,
      created_at
    )
    VALUES (?, ?, ?, 'PENDING', ?, NOW(), NOW())
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
      v.title AS volunteer_title
    FROM certificate_submission cs
    INNER JOIN volunteer_participation vp
      ON cs.volunteer_participation_id = vp.id
    INNER JOIN volunteer v
      ON vp.volunteer_id = v.id
    WHERE vp.user_id = ?
    ORDER BY cs.created_at DESC
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
      rejected_reason,
      created_at
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
