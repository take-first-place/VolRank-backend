const userService = require("../services/userService");
const { success, fail } = require("../utils/response");

// 회원 가입
// POST /api/users/register
const register = async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    
    return success(
        res,
        user,
        "회원 가입 성공",
        201
    );
  } catch (err) {
    console.error("회원 가입 중 오류:", err);

    return fail(
        res,
        err.message || "회원 가입 실패",
        err.status || 500
    );
  }
};

// 이메일 인증 코드 전송
// POST /api/users/send-code
const sendCode = async (req, res) => {
  const { email } = req.body;

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  codeStore.saveCode(email, code);

  console.log("인증코드:", code); // 실제로는 이메일 전송

  return success(
    res,
    null,
    "인증 코드가 이메일로 전송되었습니다.",
    200
  );
};

// 이메일 인증 코드 검증
// POST /api/users/verify-code
const verifyCode = (req, res) => {
  const { email, code } = req.body;

  const isValid = codeStore.verifyCode(email, code);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: "인증 코드가 올바르지 않습니다.",
    });
  }

  return success(
    res,
    null,
    "인증이 완료되었습니다.",
    200
  );
};