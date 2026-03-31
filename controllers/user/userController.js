import { registerUser } from "../../services/user/userService.js";
import { success, fail } from "../../utils/response.js";
import { saveCode, verifyCode } from "../../utils/codeStore.js";

// 회원 가입
// POST /api/users/register
export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    return success(res, user, "회원 가입 성공", 201);
  } catch (err) {
    console.error("회원 가입 중 오류:", err);

    return fail(res, err.message || "회원 가입 실패", err.status || 500);
  }
};

// 이메일 인증 코드 전송
// POST /api/users/send-code
export const sendCode = async (req, res) => {
  const { email } = req.body;

  const code = saveCode(email);

  await sendMail(email, "이메일 인증 코드", `<h1>인증 코드: ${code}</h1>`);

  return success(res, null, "인증 코드가 전송되었습니다.", 200);
};

// 이메일 인증 코드 검증
// POST /api/users/verify-code
export const verifyingCode = (req, res) => {
  const { email, code } = req.body;

  const isValid = verifyCode(email, code);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: "인증 코드가 올바르지 않습니다.",
    });
  }

  return success(res, null, "인증이 완료되었습니다.", 200);
};
