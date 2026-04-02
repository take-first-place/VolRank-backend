import conn from "../../config/db.js";

export const insertVolunteer = async (v) => {
    const query = `
    INSERT INTO volunteer (
        title,
        organization_name,
        place,
        start_date,
        end_date,
        external_id
    )
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        organization_name = VALUES(organization_name),
        place = VALUES(place),
        start_date = VALUES(start_date),
        end_date = VALUES(end_date)
    `;

    const values = [
        v.title,
        v.organization_name,
        v.place,
        v.start_date,
        v.end_date,
        v.external_id
    ];

    await conn.query(query, values);
};

