const conn = require('../config/db');

// 사용자 조회
const findByEmail = async (email) => {
    const sql = 'SELECT * FROM user WHERE email = ?';
    const [rows] = await conn.execute(sql, [email]);
    
    return rows[0];
}

const findById = async (id) => {
    const sql = 'SELECT * FROM user WHERE id = ?';
    const [rows] = await conn.execute(sql, [id]);

    return rows[0];
}

// 사용자 생성
const createUser = async ({
    username,
    nickname,
    email,
    password,
    region_code

}) => {

    const sql = `INSERT INTO user (
                    username,
                    nickname, 
                    email, 
                    password, 
                    region_code) 
                VALUES (?, ?, ?, ?, ?)`;

    const [result] = await conn.execute(sql, [
        username,
        nickname, 
        email, 
        password, 
        region_code
    ]);

    return result;
}