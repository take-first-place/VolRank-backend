const store = new Map();
const verifiedSet = new Set();

const EXPIRES_MIN = Number(process.env.EMAIL_VERIFY_EXPIRES_MIN) || 5;

const generate6DigitCode = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

export const saveCode = (email) => {
  const code = generate6DigitCode();
  const expiresAt = Date.now() + EXPIRES_MIN * 60 * 1000;

  store.set(email, { code, expiresAt });
  return code;
};

export const verifyCode = (email, inputCode) => {

  const entry = store.get(email);

  if (!entry || entry.code !== String(inputCode)){
    return "invalid";
  }

  if (Date.now() > entry.expiresAt) {
    return "expired";
  }

  store.delete(email);
  verifiedSet.add(email); // ✅ 이것도 빠져있었음

  return "ok";
};

export const refreshCode = (email) => {
  verifiedSet.delete(email);
  return saveCode(email);
};

export const isVerified = (email) => verifiedSet.has(email);
export const clearVerified = (email) => verifiedSet.delete(email);
