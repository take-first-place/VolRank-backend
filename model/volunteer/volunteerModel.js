import conn from "../../config/db.js";

export const findVolunteers = async (query) => {
    const { page, size } = query;
    const pageNum = Number(query.page);
    const sizeNum = Number(query.size);

    const offset = (pageNum - 1) * sizeNum;

    let sql = `
    SELECT id, title, description, volunteer_type, organization_name, region_code, place, recruit_start_at, recruit_end_at, start_date, end_date, recruit_count, volunteer_hour, status
    FROM volunteer
    WHERE 1=1
    `;

    let countSql = "SELECT COUNT(*) AS total FROM volunteer WHERE 1=1";

    const params = [];
    const countParams = [];

    // 검색 (LIKE로 구현, 제목과 내용만)
    if (query.keyword) {
        sql += " AND (title LIKE ? OR description LIKE ?)";
        countSql += " AND (title LIKE ? OR description LIKE ?)";

        const keyword = `%${query.keyword}%`;
        params.push(keyword, keyword);
        countParams.push(keyword, keyword);
    }

    // 필터 (LIKE X, 정확 비교)
    if (query.region_code) {
        sql += " AND region_code = ?";
        countSql += " AND region_code = ?";

        params.push(query.region_code);
        countParams.push(query.region_code);
    }

    if (query.volunteer_type) {
        sql += " AND volunteer_type = ?";
        countSql += " AND volunteer_type = ?";

        params.push(query.volunteer_type);
        countParams.push(query.volunteer_type);
    }

    if (query.status) {
        sql += " AND status = ?";
        countSql += " AND status = ?";

        params.push(query.status);
        countParams.push(query.status);
    }

    // 정렬 + 페이징
    sql += " ORDER BY id DESC LIMIT ?, ?";
    params.push(offset, sizeNum);

    const [rows] = await conn.query(sql, params);
    const [countRows] = await conn.query(countSql, countParams);

    const total = countRows[0].total;

    return {
        page: pageNum,
        size: sizeNum,
        total,
        totalPages: Math.ceil(total / size),
        data: rows
    };
};

