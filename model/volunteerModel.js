import conn from "../config/db.js";

export const getAll = async() => {
    const sql = `
    SELECT id, title, description, volunteer_type, organization_name, region_code, place, recruit_start_at, recruit_end_at, start_date, end_date, recruit_count, volunteer_hour, status
    FROM volunteer
    `;
    const [rows] = await conn.query(sql);
    return rows;
};