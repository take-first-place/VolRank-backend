export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    const error = new Error("관리자 계정으로만 이용 가능한 기능입니다.");
    error.status = 403;
    next(error);
  }
};
