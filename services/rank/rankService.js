import { findRegionByCode } from "../../model/region/regionModel.js";
import {
  getNationalTop100,
  getSidoTop100,
  getSigunguTop100,
  getMyNationalRank,
  getMySidoRank,
  getMySigunguRank,
} from "../../model/rank/rankModel.js";

const addIsMeFlag = (rows, userId) => {
  return rows.map((row) => ({
    ...row,
    is_me: userId ? row.user_id === userId : false,
  }));
};

// 전국 랭킹 조회
export const getNationalRanking = async (userId) => {
  const top100 = await getNationalTop100();
  const top100WithFlag = addIsMeFlag(top100, userId);

  if (!userId) {
    return { top100: top100WithFlag, myRank: null };
  }

  const isInTop100 = top100WithFlag.some((row) => row.user_id === userId);

  if (isInTop100) {
    return { top100: top100WithFlag, myRank: null };
  }

  const myRank = await getMyNationalRank(userId);

  return {
    top100: top100WithFlag,
    myRank,
  };
};

// 지역 랭킹 조회
export const getRegionalRanking = async (regionCode, userId) => {
  const region = await findRegionByCode(regionCode);

  if (!region) {
    const error = new Error("존재하지 않는 지역입니다.");
    error.status = 404;
    throw error;
  }

  let top100 = [];
  let myRank = null;

  if (region.level === 1) {
    top100 = await getSidoTop100(regionCode);

    if (userId) {
      myRank = await getMySidoRank(userId, regionCode);
    }
  } else if (region.level === 2) {
    top100 = await getSigunguTop100(regionCode);

    if (userId) {
      myRank = await getMySigunguRank(userId, regionCode);
    }
  } else {
    const error = new Error("지원하지 않는 지역 레벨입니다.");
    error.status = 400;
    throw error;
  }

  const top100WithFlag = addIsMeFlag(top100, userId);

  if (!userId) {
    return { top100: top100WithFlag, myRank: null };
  }

  const isInTop100 = top100WithFlag.some((row) => row.user_id === userId);

  if (isInTop100) {
    return { top100: top100WithFlag, myRank: null };
  }

  return {
    top100: top100WithFlag,
    myRank,
  };
};
