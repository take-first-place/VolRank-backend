import conn from "../../config/db.js";

export const getVolunteerStatsByUserId = async (userId) => {
    const sql = `
    SELECT
        SUM(approved_volunyteer_hour) AS total_hours,
        COUNT(*) AS total_activities
    FROM volunteer_participation
    WHERE user_id = ? AND participation_status = 'COMPLETED'
    `;
    const [rows] = await conn.query(sql, [userId]);
    
    return {
        total_hours: rows[0].total_hours || 0,
        total_activities: rows[0].total_activities || 0
    };
};

