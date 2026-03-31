import pool from "../config/db.js";

export const findAllSidos = async () => {
  const sql = `
    SELECT 
      region_code AS regionCode,
      name,
      level,
      parent_code AS parentCode
    FROM region
    WHERE level = 1
    ORDER BY region_code ASC
  `;

  const [rows] = await pool.query(sql);
  return rows;
};

export const findSigunguBySidoCode = async (sidoCode) => {
  const sql = `
    SELECT 
      region_code AS regionCode,
      name,
      level,
      parent_code AS parentCode
    FROM region
    WHERE level = 2
      AND parent_code = ?
    ORDER BY region_code ASC
  `;

  const [rows] = await pool.query(sql, [sidoCode]);
  return rows;
};
