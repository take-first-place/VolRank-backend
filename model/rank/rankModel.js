import conn from "../../config/db.js";

// 전국 TOP 100 조회
export const getNationalTop100 = async () => {
  const sql = `
    SELECT
      u.id AS user_id,
      u.nickname,
      u.region_code,
      COALESCE(SUM(vp.approved_volunteer_hour), 0) AS total_hours,
      RANK() OVER (
        ORDER BY COALESCE(SUM(vp.approved_volunteer_hour), 0) DESC
      ) AS rank_position
    FROM users u
    LEFT JOIN volunteer_participation vp
      ON vp.user_id = u.id
      AND vp.participation_status = 'APPROVED'
    WHERE u.role = 'USER'
    GROUP BY u.id, u.nickname, u.region_code
    ORDER BY total_hours DESC, user_id ASC
    LIMIT 100
  `;

  const [rows] = await conn.execute(sql);
  return rows;
};

// 시도 기준 TOP 100 조회
export const getSidoTop100 = async (sidoCode) => {
  const sql = `
    SELECT
      u.id AS user_id,
      u.nickname,
      u.region_code,
      COALESCE(SUM(vp.approved_volunteer_hour), 0) AS total_hours,
      RANK() OVER (
        ORDER BY COALESCE(SUM(vp.approved_volunteer_hour), 0) DESC
      ) AS rank_position
    FROM users u
    LEFT JOIN volunteer_participation vp
      ON vp.user_id = u.id
      AND vp.participation_status = 'APPROVED'
    JOIN region r
      ON r.region_code = u.region_code
    WHERE u.role = 'USER'
      AND r.parent_code = ?
    GROUP BY u.id, u.nickname, u.region_code
    ORDER BY total_hours DESC, user_id ASC
    LIMIT 100
  `;

  const [rows] = await conn.execute(sql, [sidoCode]);
  return rows;
};

// 시군구 기준 TOP 100 조회
export const getSigunguTop100 = async (sigunguCode) => {
  const sql = `
    SELECT
      u.id AS user_id,
      u.nickname,
      u.region_code,
      COALESCE(SUM(vp.approved_volunteer_hour), 0) AS total_hours,
      RANK() OVER (
        ORDER BY COALESCE(SUM(vp.approved_volunteer_hour), 0) DESC
      ) AS rank_position
    FROM users u
    LEFT JOIN volunteer_participation vp
      ON vp.user_id = u.id
      AND vp.participation_status = 'APPROVED'
    WHERE u.role = 'USER'
      AND u.region_code = ?
    GROUP BY u.id, u.nickname, u.region_code
    ORDER BY total_hours DESC, user_id ASC
    LIMIT 100
  `;

  const [rows] = await conn.execute(sql, [sigunguCode]);
  return rows;
};

// 전국 기준 내 순위 조회
export const getMyNationalRank = async (userId) => {
  const sql = `
    SELECT
      rank_position,
      total_hours,
      user_id,
      nickname,
      region_code
    FROM (
      SELECT
        u.id AS user_id,
        u.nickname,
        u.region_code,
        COALESCE(SUM(vp.approved_volunteer_hour), 0) AS total_hours,
        RANK() OVER (
          ORDER BY COALESCE(SUM(vp.approved_volunteer_hour), 0) DESC
        ) AS rank_position
      FROM users u
      LEFT JOIN volunteer_participation vp
        ON vp.user_id = u.id
        AND vp.participation_status = 'APPROVED'
      WHERE u.role = 'USER'
      GROUP BY u.id, u.nickname, u.region_code
    ) ranked
    WHERE user_id = ?
  `;

  const [rows] = await conn.execute(sql, [userId]);
  return rows[0] ?? null;
};

// 시도 기준 내 순위 조회
export const getMySidoRank = async (userId, sidoCode) => {
  const sql = `
    SELECT
      rank_position,
      total_hours,
      user_id,
      nickname,
      region_code
    FROM (
      SELECT
        u.id AS user_id,
        u.nickname,
        u.region_code,
        COALESCE(SUM(vp.approved_volunteer_hour), 0) AS total_hours,
        RANK() OVER (
          ORDER BY COALESCE(SUM(vp.approved_volunteer_hour), 0) DESC
        ) AS rank_position
      FROM users u
      LEFT JOIN volunteer_participation vp
        ON vp.user_id = u.id
        AND vp.participation_status = 'APPROVED'
      JOIN region r
        ON r.region_code = u.region_code
      WHERE u.role = 'USER'
        AND r.parent_code = ?
      GROUP BY u.id, u.nickname, u.region_code
    ) ranked
    WHERE user_id = ?
  `;

  const [rows] = await conn.execute(sql, [sidoCode, userId]);
  return rows[0] ?? null;
};

// 시군구 기준 내 순위 조회
export const getMySigunguRank = async (userId, sigunguCode) => {
  const sql = `
    SELECT
      rank_position,
      total_hours,
      user_id,
      nickname,
      region_code
    FROM (
      SELECT
        u.id AS user_id,
        u.nickname,
        u.region_code,
        COALESCE(SUM(vp.approved_volunteer_hour), 0) AS total_hours,
        RANK() OVER (
          ORDER BY COALESCE(SUM(vp.approved_volunteer_hour), 0) DESC
        ) AS rank_position
      FROM users u
      LEFT JOIN volunteer_participation vp
        ON vp.user_id = u.id
        AND vp.participation_status = 'APPROVED'
      WHERE u.role = 'USER'
        AND u.region_code = ?
      GROUP BY u.id, u.nickname, u.region_code
    ) ranked
    WHERE user_id = ?
  `;

  const [rows] = await conn.execute(sql, [sigunguCode, userId]);
  return rows[0] ?? null;
};
