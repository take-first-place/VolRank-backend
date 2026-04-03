import pool from "../../config/db.js";

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

export const findChildRegionsByParentCode = async (parentCode) => {
  const sql = `
    SELECT 
      region_code AS regionCode,
      name,
      level,
      parent_code AS parentCode
    FROM region
    WHERE parent_code = ?
    ORDER BY region_code ASC
  `;

  const [rows] = await pool.query(sql, [parentCode]);
  return rows;
};

export const findRegionByNameAndLevel = async ({ name, level }) => {
  const sql = `
    SELECT
      region_code,
      name,
      level,
      parent_code
    FROM region
    WHERE name = ? AND level = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [name, level]);
  return rows[0] || null;
};

export const findChildRegionByNameAndParentCode = async ({
  name,
  parentCode,
}) => {
  const sql = `
    SELECT
      region_code,
      name,
      level,
      parent_code
    FROM region
    WHERE name = ?
      AND parent_code = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [name, parentCode]);
  return rows[0] || null;
};

export const findSidoByName = async (name) => {
  return findRegionByNameAndLevel({ name, level: 1 });
};

export const findDescendantRegionByNameUnderSido = async ({
  name,
  sidoCode,
}) => {
  const sql = `
    SELECT
      region_code,
      name,
      level,
      parent_code
    FROM region
    WHERE name = ?
      AND region_code LIKE CONCAT(?, '%')
      AND region_code <> ?
    ORDER BY level DESC, CHAR_LENGTH(region_code) DESC
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [name, sidoCode, sidoCode]);
  return rows[0] || null;
};
