import conn from "../config/db.js";

// 기본 전체 조회
export const getAll = async() => {
    const sql = `
    SELECT id, title, description, volunteer_type, organization_name, region_code, place, recruit_start_at, recruit_end_at, start_date, end_date, recruit_count, volunteer_hour, status
    FROM volunteer
    `;
    const [rows] = await conn.query(sql);
    return rows;
};

// 페이징
export const findPage = async (page, size) => {
    const offset = (page - 1) * size;
    const sql = `
    SELECT id, title, description, volunteer_type, organization_name, region_code, place, recruit_start_at, recruit_end_at, start_date, end_date, recruit_count, volunteer_hour, status
    FROM volunteer
    ORDER BY id DESC
    LIMIT ?, ?
    `;
    const [rows] = await conn.query(sql, [offset, Number(size)]);
    const [countRows] = await conn.query("SELECT COUNT(*) AS total FROM volunteer");
    
    const total = countRows[0].total;
    
    return {
        page: Number(page),
        size: Number(size),
        totalPages: Math.ceil(total / size),
        data: rows
    };
};
