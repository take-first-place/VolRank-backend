import pool from "../../config/db.js";

export const saveExternalRegionMapping = async ({
  externalRegionCode,
  externalRegionName,
  regionCode,
  isActive = true,
}) => {
  const sql = `
    INSERT INTO volunteer_region_mapping (
      external_region_code,
      external_region_name,
      region_code,
      is_active,
      synced_at
    )
    VALUES (?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      external_region_name = VALUES(external_region_name),
      region_code = VALUES(region_code),
      is_active = VALUES(is_active),
      synced_at = NOW()
  `;

  await pool.query(sql, [
    externalRegionCode,
    externalRegionName,
    regionCode,
    isActive,
  ]);
};

export const findActiveExternalRegionMappingByCode = async (
  externalRegionCode,
) => {
  const sql = `
    SELECT
      id,
      external_region_code AS externalRegionCode,
      external_region_name AS externalRegionName,
      region_code AS regionCode,
      is_active AS isActive,
      synced_at AS syncedAt
    FROM volunteer_region_mapping
    WHERE external_region_code = ?
      AND is_active = TRUE
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [externalRegionCode]);
  return rows[0] || null;
};

export const findRegionCodeBy1365Code = async (externalCode) => {
  const query = `
    SELECT region_code
    FROM volunteer_region_mapping
    WHERE external_region_code = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(query, [externalCode]);
  return rows[0]?.region_code || null;
};
