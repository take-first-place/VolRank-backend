import jwt from "jsonwebtoken";
import { fail } from "../utils/response.js";

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return fail(res, "인증 토큰이 없습니다.", 401);
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // 이후 라우트에서 req.user.id 로 접근 가능
        next();
    } catch (err) {
        return fail(res, "유효하지 않은 토큰입니다.", 401);
    }
};
