const store = new Map();

const EXPIRES_MIN = Number(process.env.EMAIL_VERIFY_EXPIRES_MIN) || 5;

const generate6DigitCode = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
}
    

const saveCode = (email) => {
  const code = generate6DigitCode();
  const expiresAt = Date.now() + EXPIRES_MIN * 60 * 1000;

  store.set(email, { code, expiresAt });

  return code;
}

// 코드 검증 — 결과: 'ok' | 'expired' | 'invalid'
const verifyCode = (email, inputCode) => {
  const entry = store.get(email);

  if (!entry || entry.code !== String(inputCode)) {
    return "invalid";
  }

  if (Date.now() > entry.expiresAt) {
    return "expired";
  }

  store.delete(email); // 인증 성공 시 즉시 삭제
  
  return "ok";
}

// 재발송 시 기존 코드 덮어쓰기
const refreshCode = (email) => {
  return saveCode(email);
}

module.exports = { saveCode, verifyCode, refreshCode };
