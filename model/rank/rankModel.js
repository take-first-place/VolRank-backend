import conn from "../../config/db.js";

// 전국 TOP 100 조회
export const getNationalTop100 = async () => {
  const sql = `
    SELECT
      u.id AS user_id,
      u.nickname,
      u.region_code,
      CASE
        WHEN parent_region.name IS NOT NULL THEN CONCAT(parent_region.name, ' ', child_region.name)
        ELSE child_region.name
      END AS full_region_name,
      COALESCE(SUM(vp.approved_volunteer_hour), 0) AS total_hours,
      RANK() OVER (
        ORDER BY COALESCE(SUM(vp.approved_volunteer_hour), 0) DESC
      ) AS rank_position
    FROM users u
    LEFT JOIN volunteer_participation vp
      ON vp.user_id = u.id
      AND vp.participation_status = 'APPROVED'
    LEFT JOIN region child_region
      ON child_region.region_code = u.region_code
    LEFT JOIN region parent_region
      ON parent_region.region_code = child_region.parent_code
    WHERE u.role = 'USER'
    GROUP BY
      u.id,
      u.nickname,
      u.region_code,
      child_region.name,
      parent_region.name
    HAVING COALESCE(SUM(vp.approved_volunteer_hour), 0) > 0
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
      child_region.name AS region_name,
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
    LEFT JOIN region child_region
      ON child_region.region_code = u.region_code
    WHERE u.role = 'USER'
      AND (
        u.region_code = ?
        OR r.parent_code = ?
      )
    GROUP BY
      u.id,
      u.nickname,
      u.region_code,
      child_region.name
    HAVING COALESCE(SUM(vp.approved_volunteer_hour), 0) > 0
    ORDER BY rank_position ASC
    LIMIT 100
  `;

  const [rows] = await conn.execute(sql, [regionCode, regionCode]);
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
      region_code,
      full_region_name
    FROM (
      SELECT
        u.id AS user_id,
        u.nickname,
        u.region_code,
        CASE
          WHEN parent_region.name IS NOT NULL THEN CONCAT(parent_region.name, ' ', child_region.name)
          ELSE child_region.name
        END AS full_region_name,
        COALESCE(SUM(vp.approved_volunteer_hour), 0) AS total_hours,
        RANK() OVER (
          ORDER BY COALESCE(SUM(vp.approved_volunteer_hour), 0) DESC
        ) AS rank_position
      FROM users u
      LEFT JOIN volunteer_participation vp
        ON vp.user_id = u.id
        AND vp.participation_status = 'APPROVED'
      LEFT JOIN region child_region
        ON child_region.region_code = u.region_code
      LEFT JOIN region parent_region
        ON parent_region.region_code = child_region.parent_code
      WHERE u.role = 'USER'
      GROUP BY
        u.id,
        u.nickname,
        u.region_code,
        child_region.name,
        parent_region.name
      HAVING COALESCE(SUM(vp.approved_volunteer_hour), 0) > 0
    ) ranked
    WHERE user_id = ?
  `;

  const [rows] = await conn.execute(sql, [userId]);
  return rows[0] ?? null;
};

// 지역 기준 내 순위 조회
export const getMyRegionalRank = async (userId, regionCode) => {
  const sql = `
    SELECT
      rank_position,
      total_hours,
      user_id,
      nickname,
      region_code,
      region_name
    FROM (
      SELECT
        u.id AS user_id,
        u.nickname,
        u.region_code,
        child_region.name AS region_name,
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
      LEFT JOIN region child_region
        ON child_region.region_code = u.region_code
      WHERE u.role = 'USER'
        AND (
          u.region_code = ?
          OR r.parent_code = ?
        )
      GROUP BY
        u.id,
        u.nickname,
        u.region_code,
        child_region.name
      HAVING COALESCE(SUM(vp.approved_volunteer_hour), 0) > 0
    ) ranked
    WHERE user_id = ?
  `;

  const [rows] = await conn.execute(sql, [regionCode, regionCode, userId]);
  return rows[0] ?? null;
};
