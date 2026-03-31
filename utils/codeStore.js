const store = new Map();

const EXPIRES_MIN = Number(process.env.EMAIL_VERIFY_EXPIRES_MIN) || 5;

// 6자리 코드 생성
const generate6DigitCode = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

// 코드 저장 + 생성
export const saveCode = (email) => {
  const code = generate6DigitCode();
  const expiresAt = Date.now() + EXPIRES_MIN * 60 * 1000;

  store.set(email, { code, expiresAt });

  return code;
};

// 코드 검증
// 결과: 'ok' | 'expired' | 'invalid'
export const verifyCode = (email, inputCode) => {
  const entry = store.get(email);

  if (!entry || entry.code !== String(inputCode)) {
    return "invalid";
  }

  if (Date.now() > entry.expiresAt) {
    return "expired";
  }

  store.delete(email); // 성공 시 삭제

  return "ok";
};

// 재발송
export const refreshCode = (email) => {
  return saveCode(email);
};

