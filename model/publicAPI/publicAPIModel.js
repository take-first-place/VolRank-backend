import conn from "../../config/db.js";

// 봉사활동 목록 삽입
export const insertVolunteer = async (v) => {
  const query = `
    INSERT INTO volunteer (
        title,
        description,
        volunteer_type,
        organization_name,
        region_code,
        place,
        recruit_start_at,
        recruit_end_at,
        start_date,
        end_date,
        recruit_count,
        volunteer_hour,
        status,
        external_url,
        external_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        volunteer_type = VALUES(volunteer_type),
        organization_name = VALUES(organization_name),
        region_code = VALUES(region_code),
        place = VALUES(place),
        recruit_start_at = VALUES(recruit_start_at),
        recruit_end_at = VALUES(recruit_end_at),
        start_date = VALUES(start_date),
        end_date = VALUES(end_date),
        recruit_count = VALUES(recruit_count),
        volunteer_hour = VALUES(volunteer_hour),
        status = VALUES(status),
        external_url = VALUES(external_url)
    `;

  const values = [
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
    v.volunteer_hour,
    v.status,
    v.external_url,
    v.external_id,
  ];

  await conn.query(query, values);
};
