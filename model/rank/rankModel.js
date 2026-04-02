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
    GROUP BY u.id, u.nickname, u.region_code
    ORDER BY rank_position ASC
    LIMIT 100
  `;

  const [rows] = await conn.execute(sql);

  return rows;
};

// 지역별 TOP 100 조회
export const getRegionalTop100 = async (regionCode) => {
  const sql = `
    SELECT
      u.id AS user_id,
      u.nickname,
      u.region_code,
      COALESCE(SUM(vp.approved_volunteer_hour), 0) AS total_hours,
      RANK() OVER (
        PARTITION BY u.region_code
        ORDER BY COALESCE(SUM(vp.approved_volunteer_hour), 0) DESC
      ) AS rank_position
    FROM users u
    LEFT JOIN volunteer_participation vp
      ON vp.user_id = u.id
      AND vp.participation_status = 'APPROVED'
    WHERE u.region_code = ?
    GROUP BY u.id, u.nickname, u.region_code
    ORDER BY rank_position ASC
    LIMIT 100
  `;

  const [rows] = await conn.execute(sql, [regionCode]);
  
  return rows;
};

// 전국 기준 내 순위 조회
export const getMyNationalRank = async (userId) => {
  const sql = `
    SELECT rank_position, total_hours, user_id, nickname, region_code
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
      GROUP BY u.id, u.nickname, u.region_code
    ) ranked
    WHERE user_id = ?
  `;

  const [rows] = await conn.execute(sql, [userId]);
  
  return rows[0] ?? null;
};

// 지역 기준 내 순위 조회
export const getMyRegionalRank = async (userId, regionCode) => {
  const sql = `
    SELECT rank_position, total_hours, user_id, nickname, region_code
    FROM (
      SELECT
        u.id AS user_id,
        u.nickname,
        u.region_code,
        COALESCE(SUM(vp.approved_volunteer_hour), 0) AS total_hours,
        RANK() OVER (
          PARTITION BY u.region_code
          ORDER BY COALESCE(SUM(vp.approved_volunteer_hour), 0) DESC
        ) AS rank_position
      FROM users u
      LEFT JOIN volunteer_participation vp
        ON vp.user_id = u.id
        AND vp.participation_status = 'APPROVED'
      WHERE u.region_code = ?
      GROUP BY u.id, u.nickname, u.region_code
    ) ranked
    WHERE user_id = ?
  `;

  const [rows] = await conn.execute(sql, [regionCode, userId]);
  
  return rows[0] ?? null;
};
