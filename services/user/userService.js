import bcrypt from "bcrypt";
import * as userModel from "../../model/user/userModel.js";
import { getMyVolunteerSummary } from "../../model/user/userModel.js";
import { isVerified, clearVerified } from "../../utils/codeStore.js";

export const findById = async (id) => {
  return await userModel.findById(id);
};

export const registerUser = async ({
  username,
  nickname,
  email,
  password,
  region_code,
}) => {
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
  const user = await userModel.createUser({
    username,
    nickname,
    email,
    password: hashedPassword,
    region_code,
  });

  clearVerified(email);
  return user;
};

export const getMyPageSummary = async (userId) => {
  const user = await findById(userId);

  if (!user) {
    const error = new Error("사용자를 찾을 수 없습니다.");
    error.status = 404;
    throw error;
  }

  const summary = await getMyVolunteerSummary(userId);

  return {
    userId: user.id,
    email: user.email,
    nickname: user.nickname,
    username: user.username,
    regionCode: user.region_code,
    regionName: user.region_name,
    fullRegionName: user.full_region_name,
    createdAt: user.created_at,
    totalVolunteerHour: Number(summary?.total_volunteer_hour || 0),
    approvedParticipationCount: Number(
      summary?.approved_participation_count || 0,
    ),
  };
};
