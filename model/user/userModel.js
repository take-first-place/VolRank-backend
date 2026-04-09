import conn from "../../config/db.js";

// 사용자 조회
export const findByEmail = async (email) => {
  const sql = "SELECT * FROM users WHERE email = ?";
  const [rows] = await conn.execute(sql, [email]);

  return rows[0];
};

export const findById = async (id) => {
  const sql = `
    SELECT
      u.id,
      u.username,
      u.nickname,
      u.email,
      u.password,
      u.region_code,
      u.created_at,
      u.role,
      r.name AS region_name,
      pr.name AS parent_region_name,
      CASE
        WHEN r.level = 2 AND pr.name IS NOT NULL THEN CONCAT(pr.name, ' ', r.name)
        WHEN r.level = 1 THEN r.name
        ELSE r.name
      END AS full_region_name
    FROM users u
    LEFT JOIN region r
      ON r.region_code = u.region_code
    LEFT JOIN region pr
      ON pr.region_code = r.parent_code
    WHERE u.id = ?
  `;

  const [rows] = await conn.execute(sql, [id]);

  return rows[0];
};

// 사용자 생성
export const createUser = async ({
  username,
  nickname,
  email,
  password,
  region_code,
}) => {
  const sql = `
    INSERT INTO users (
      username,
      nickname, 
      email, 
      password, 
      region_code
    ) 
    VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await conn.execute(sql, [
    username,
    nickname,
    email,
    password,
    region_code,
  ]);

  return result;
};

export const getMyVolunteerSummary = async (userId) => {
  const sql = `
    SELECT
      COALESCE(SUM(vp.approved_volunteer_hour), 0) AS total_volunteer_hour,
      COUNT(*) AS approved_participation_count
    FROM volunteer_participation vp
    WHERE vp.user_id = ?
      AND vp.participation_status = 'APPROVED'
  `;

  const [rows] = await conn.execute(sql, [userId]);
  return rows[0];
};
