import jwt from "jsonwebtoken";
import { findByEmail } from "../../model/user/userModel";


// 로그인
export const login = async ({ email, password }) => {
    const user = await findByEmail(email);

    if (!user) {
        const error = new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
        error.status = 401;
        throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        const error = new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
        error.status = 401;
        throw error;
    }   

    const token = jwt.sign(
    { 
        id: user.id, 
        email: user.email 
    }, 
    process.env.JWT_SECRET, 
    {
        expiresIn: process.env.JWT_EXPIRES_IN || "5h",
    });

    // 비밀번호를 응답에서 제외
    const { password: _, ...userWithoutPassword } = user;
    
    return {
        token,
        user: userWithoutPassword
    };
}