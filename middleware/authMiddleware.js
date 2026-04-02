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

// 랭킹 조회는 로그인 여부에 따라 다르게 처리하기 위해 optionalAuth 미들웨어 추가
export const optionalAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token){
        return next();
    }
    
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        next(); // 토큰 만료/위조여도 그냥 통과 (비로그인 처리)
    }
};