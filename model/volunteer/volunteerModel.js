import conn from "../../config/db.js";

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

// 검색
export const search = async (query) => {
    let sql = `
    SELECT id, title, description, volunteer_type, organization_name, region_code, place, recruit_start_at, recruit_end_at, start_date, end_date, recruit_count, volunteer_hour, status
    FROM volunteer
    WHERE 1=1
    `;
    const params = [];

    if (query.id) {
        sql += " AND id LIKE ?";
        params.push(`%${query.id}%`);
    }

    if (query.title) {
        sql += " AND title LIKE ?";
        params.push(`%${query.title}%`);
    }

    if (query.volunteer_type) {
        sql += " AND volunteer_type LIKE ?";
        params.push(`%${query.volunteer_type}%`);
    }
    
    if (query.organization_name) {
        sql += " AND organization_name LIKE ?";
        params.push(`%${query.organization_name}%`);
    }

    if (query.region_code) {
        sql += " AND region_code LIKE ?";
        params.push(`%${query.region_code}%`);
    }

    if (query.place) {
        sql += " AND place LIKE ?";
        params.push(`%${query.place}%`);
    }
}
