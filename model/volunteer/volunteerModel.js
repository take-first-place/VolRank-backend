import conn from "../../config/db.js";

const formatRegionName = ({ level, region_name, parent_name }) => {
  if (!region_name) return null;
  if (Number(level) === 1) return region_name;
  if (Number(level) === 2 && parent_name) {
    return `${parent_name} ${region_name}`;
  }
  return region_name;
};

export const createVolunteerPerformance = async (volunteerData) => {
  const {
    userId,
    activityTitle,
    organizationName,
    regionCode,
    place,
    startDate,
    endDate,
  } = volunteerData;

  const sql = `
    INSERT INTO volunteer_participation (
      user_id,
      activity_title,
      organization_name,
      region_code,
      place,
      start_date,
      end_date,
      requested_volunteer_hour,
      approved_volunteer_hour,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, NOW())
  `;

  const [result] = await conn.query(sql, [
    userId,
    activityTitle,
    organizationName,
    regionCode,
    place,
    startDate,
    endDate,
  ]);

  return result;
};

export const findVolunteers = async (query) => {
  const pageNum = Number(query.page) || 1;
  const sizeNum = Number(query.size) || 10;
  const offset = (pageNum - 1) * sizeNum;

  let sql = `
    SELECT
      v.id,
      v.title,
      v.description,
      v.volunteer_type,
      v.organization_name,
      v.region_code,
      v.place,
      v.recruit_start_at,
      v.recruit_end_at,
      v.start_date,
      v.end_date,
      v.recruit_count,
      v.act_begin_time,
      v.act_end_time,
      v.status,
      r.name AS region_name,
      r.level,
      r.parent_code,
      p.name AS parent_name
    FROM volunteer v
    LEFT JOIN region r
      ON v.region_code = r.region_code
    LEFT JOIN region p
      ON r.parent_code = p.region_code
    WHERE 1 = 1
  `;

  let countSql = `
    SELECT COUNT(*) AS total
    FROM volunteer v
    LEFT JOIN region r
      ON v.region_code = r.region_code
    WHERE 1 = 1
  `;

  const params = [];
  const countParams = [];

  if (query.keyword) {
    sql += " AND (v.title LIKE ? OR v.description LIKE ?)";
    countSql += " AND (v.title LIKE ? OR v.description LIKE ?)";
    const keyword = `%${query.keyword}%`;
    params.push(keyword, keyword);
    countParams.push(keyword, keyword);
  }

  if (query.region_code) {
    sql += `
      AND (
        v.region_code = ?
        OR r.parent_code = ?
      )
    `;
    countSql += `
      AND (
        v.region_code = ?
        OR r.parent_code = ?
      )
    `;
    params.push(query.region_code, query.region_code);
    countParams.push(query.region_code, query.region_code);
  }

  if (query.volunteer_type) {
    sql += " AND v.volunteer_type = ?";
    countSql += " AND v.volunteer_type = ?";
    params.push(query.volunteer_type);
    countParams.push(query.volunteer_type);
  }

  if (query.status) {
    if (query.status === "ENDED") {
      sql += " AND v.status IN ('CLOSED', 'FINISHED')";
      countSql += " AND v.status IN ('CLOSED', 'FINISHED')";
    } else {
      sql += " AND v.status = ?";
      countSql += " AND v.status = ?";
      params.push(query.status);
      countParams.push(query.status);
    }
  }

  sql += " ORDER BY v.id DESC LIMIT ?, ?";
  params.push(offset, sizeNum);

  const [rows] = await conn.query(sql, params);
  const [countRows] = await conn.query(countSql, countParams);

  const total = countRows[0].total;

  const data = rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    volunteer_type: row.volunteer_type,
    organization_name: row.organization_name,
    region_code: row.region_code,
    region_name: formatRegionName(row),
    place: row.place,
    recruit_start_at: row.recruit_start_at,
    recruit_end_at: row.recruit_end_at,
    start_date: row.start_date,
    end_date: row.end_date,
    recruit_count: row.recruit_count,
    act_begin_time: row.act_begin_time,
    act_end_time: row.act_end_time,
    status: row.status,
  }));

  return {
    page: pageNum,
    size: sizeNum,
    total,
    totalPages: Math.ceil(total / sizeNum),
    data,
  };
};

export const findVolunteerById = async (id) => {
  const sql = `
    SELECT
      v.id,
      v.title,
      v.description,
      v.volunteer_type,
      v.organization_name,
      v.region_code,
      v.place,
      v.recruit_start_at,
      v.recruit_end_at,
      v.start_date,
      v.end_date,
      v.recruit_count,
      v.act_begin_time,
      v.act_end_time,
      v.status,
      v.external_url,
      r.name AS region_name,
      r.level,
      p.name AS parent_name
    FROM volunteer v
    LEFT JOIN region r
      ON v.region_code = r.region_code
    LEFT JOIN region p
      ON r.parent_code = p.region_code
    WHERE v.id = ?
  `;

  const [rows] = await conn.query(sql, [id]);

  if (rows.length === 0) return null;

  const row = rows[0];

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    volunteer_type: row.volunteer_type,
    organization_name: row.organization_name,
    region_code: row.region_code,
    region_name: formatRegionName(row),
    place: row.place,
    recruit_start_at: row.recruit_start_at,
    recruit_end_at: row.recruit_end_at,
    start_date: row.start_date,
    end_date: row.end_date,
    recruit_count: row.recruit_count,
    act_begin_time: row.act_begin_time,
    act_end_time: row.act_end_time,
    status: row.status,
    external_url: row.external_url,
  };
};
