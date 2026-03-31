import bcrypt from "bcrypt";
import * as userModel from "../../model/userModel.js";

// == 회원 가입 ==
export const registerUser = async ({
  username,
  nickname,
  email,
  password,
  region_code,
}) => {
  const existingEmail = await userModel.findByEmail(email);

  if (existingEmail) {
    const error = new Error("이미 사용 중인 이메일입니다.");
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userModel.createUser({
    username,
    nickname,
    email,
    password: hashedPassword,
    region_code,
  });

  return user;
};
