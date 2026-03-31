import { login } from "../../services/auth/authService";

// 로그인
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await login({ email, password });  

        return res.status(200).json({
            success: true,
            message: "로그인 성공",
            data: result
        });

    } catch (err) {
        console.error("로그인 중 오류:", err);
        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "로그인 실패",
        });
    }
}