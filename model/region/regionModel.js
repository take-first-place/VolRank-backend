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

  const [rows] = await pool.execute(sql);
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

  const [rows] = await pool.execute(sql, [parentCode]);
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

  const [rows] = await pool.execute(sql, [name, level]);
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

  const [rows] = await pool.execute(sql, [name, parentCode]);
  return rows[0] || null;
};

export const findSidoByName = async (name) => {
  return findRegionByNameAndLevel({ name, level: 1 });
};

export const upsertRegion = async ({ regionCode, name, level, parentCode }) => {
  const sql = `
    INSERT INTO region (
      region_code,
      name,
      level,
      parent_code
    )
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      level = VALUES(level),
      parent_code = VALUES(parent_code)
  `;

  await pool.execute(sql, [regionCode, name, level, parentCode]);
};

export const findAllRegions = async () => {
  const sql = `
    SELECT region_code, name, level, parent_code
    FROM region
  `;
  const [rows] = await pool.execute(sql);
  return rows;
};

export const findRegionByCode = async (regionCode) => {
  const sql = `
    SELECT
      region_code,
      name,
      level,
      parent_code
    FROM region
    WHERE region_code = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [regionCode]);
  return rows[0] ?? null;
};
