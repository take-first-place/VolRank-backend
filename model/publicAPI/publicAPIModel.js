import conn from "../../config/db.js";

// 봉사활동 목록 삽입
export const insertVolunteer = async (v) => {
    const query = `
    INSERT INTO volunteer (
        title,
        description,
        organization_name,
        place,
        recruit_start_at,
        recruit_end_at,
        start_date,
        end_date,
        recruit_count,
        external_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        organization_name = VALUES(organization_name),
        place = VALUES(place),
        recruit_start_at = VALUES(recruit_start_at),
        recruit_end_at = VALUES(recruit_end_at),
        start_date = VALUES(start_date),
        end_date = VALUES(end_date),
        recruit_count = VALUES(recruit_count)
    `;

    const values = [
        v.title,
        v.description,
        v.organization_name,
        v.place,
        v.recruit_start_at,
        v.recruit_end_at,
        v.start_date,
        v.end_date,
        v.recruit_count,
        v.external_id
    ];

    await conn.query(query, values);
};

