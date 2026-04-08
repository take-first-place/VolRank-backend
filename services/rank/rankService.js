import {
  getNationalTop100,
  getRegionalTop100,
  getMyNationalRank,
  getMyRegionalRank,
} from "../../model/rank/rankModel.js";

// 전국 랭킹 조회
export const getNationalRanking = async (userId) => {
  const top100 = await getNationalTop100();

  const top100WithFlag = top100.map((row) => ({
    ...row,
    is_me: userId ? row.user_id === userId : false,
  }));

  // 비로그인
  if (!userId) {
    return { top100: top100WithFlag, myRank: null };
  }

  const isInTop100 = top100WithFlag.some((row) => row.user_id === userId);

  // TOP100 안에 있으면
  if (isInTop100) {
    return { top100: top100WithFlag, myRank: null };
  }

  // TOP100 밖이면 내 순위 따로 조회
  const myRank = await getMyNationalRank(userId);
  return { top100: top100WithFlag, myRank };
};

// 지역별 랭킹 조회
export const getRegionalRanking = async (regionCode, userId) => {
  const top100 = await getRegionalTop100(regionCode);

  const top100WithFlag = top100.map((row) => ({
    ...row,
    is_me: userId ? row.user_id === userId : false,
  }));

  // 비로그인
  if (!userId) {
    return { top100: top100WithFlag, myRank: null };
  }

  const isInTop100 = top100WithFlag.some((row) => row.user_id === userId);

  // TOP100 안에 있으면
  if (isInTop100) {
    return { top100: top100WithFlag, myRank: null };
  }

  // TOP100 밖이면 내 순위 따로 조회
  const myRank = await getMyRegionalRank(userId, regionCode);
  return { top100: top100WithFlag, myRank };
};
