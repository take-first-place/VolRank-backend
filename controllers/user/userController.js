import { registerUser } from "../../services/user/userService.js";
import { success, fail } from "../../utils/response.js";
import { saveCode, verifyCode } from "../../utils/codeStore.js";
import { sendMail } from "../../utils/mailer.js";

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
  try {
    const { email } = req.body;
    
    if (!email) {
      return fail(res, "이메일을 입력해주세요.", 400);
    }

    const code = saveCode(email);
    await sendMail(email, "이메일 인증 코드", `<h1>인증 코드: ${code}</h1>`);

    return success(res, null, "인증 코드가 전송되었습니다.", 200);
  
  } catch (err) {
    console.error("코드 전송 중 오류:", err);
    return fail(res, "인증 코드 전송에 실패했습니다.", 500);
  }
};

// 이메일 인증 코드 검증
// POST /api/users/verify-code
export const verifyingCode = (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return fail(res, "이메일과 코드를 입력해주세요.", 400);
  }
  
  const result = verifyCode(email, code); // 'ok' | 'expired' | 'invalid'

  if (result === "expired") {
    return fail(res, "인증 코드가 만료되었습니다.", 400);
  }
  
  if (result === "invalid") { 
    return fail(res, "인증 코드가 올바르지 않습니다.", 400);
  }

  return success(res, null, "인증이 완료되었습니다.", 200);
};
