import bcrypt from "bcrypt";
import * as userModel from "../../model/userModel.js";
import { isVerified, clearVerified } from "../../utils/codeStore.js";

export const registerUser = async ({ 
  username,
  nickname, 
  email, 
  password, 
  region_code 
}) => {
  
  // 이메일 인증 확인
  if (!isVerified(email)) {
    const error = new Error("이메일 인증이 필요합니다.");
    error.status = 403;
    throw error;
  }

  const existingEmail = await userModel.findByEmail(email);
  if (existingEmail) {
    const error = new Error("이미 사용 중인 이메일입니다.");
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userModel.createUser({ username, nickname, email, password: hashedPassword, region_code });

  clearVerified(email); // ✅ 가입 완료 후 인증 정보 정리
  return user;
};