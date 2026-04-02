import { rankModel } from './rankModel.js';

// 전국 랭킹 조회
export const getNationalRanking = async (userId) => {
  const top100 = await rankModel.getNationalTop100();

  // 비로그인
  if (!userId) {
    return { top100, myRank: null };
  }

  const isInTop100 = top100.some((row) => row.user_id === userId);

  const top100WithFlag = top100.map((row) => ({
    ...row,
    is_me: row.user_id === userId,
  }));

  // TOP100 안에 있으면
  if (isInTop100) {
    return { top100: top100WithFlag, myRank: null };
  }

  // 밖이면 내 순위 따로 조회
  const myRank = await rankModel.getMyNationalRank(userId);
  return { top100: top100WithFlag, myRank };
};

// 지역별 랭킹 조회
export const getRegionalRanking = async (regionCode, userId) => {
  const top100 = await rankModel.getRegionalTop100(regionCode);

  // 비로그인
  if (!userId) {
    return { top100, myRank: null };
  }

  const isInTop100 = top100.some((row) => row.user_id === userId);

  const top100WithFlag = top100.map((row) => ({
    ...row,
    is_me: row.user_id === userId,
  }));

  // TOP100 안에 있으면
  if (isInTop100) {
    return { top100: top100WithFlag, myRank: null };
  }

  // 밖이면 내 순위 따로 조회
  const myRank = await rankModel.getMyRegionalRank(userId, regionCode);
  return { top100: top100WithFlag, myRank };
};
