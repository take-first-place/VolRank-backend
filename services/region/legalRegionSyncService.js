import axios from "axios";
import { upsertRegion } from "../../model/region/regionModel.js";
import { isTopLevelRegionName } from "../../utils/regionNameRules.js";

const API_URL = process.env.LEGAL_REGION_API_URL;
const SERVICE_KEY = process.env.LEGAL_REGION_API_KEY;

const validateLegalRegionConfig = () => {
  if (!API_URL) {
    const error = new Error(
      "LEGAL_REGION_API_URL 환경변수가 설정되지 않았습니다.",
    );
    error.status = 500;
    throw error;
  }

  if (!SERVICE_KEY) {
    const error = new Error(
      "LEGAL_REGION_SERVICE_KEY 환경변수가 설정되지 않았습니다.",
    );
    error.status = 500;
    throw error;
  }
};

const normalizeCode = (value, length) => {
  return String(value ?? "").padStart(length, "0");
};

const isSidoItem = ({ sggCd, umdCd, riCd }) => {
  return sggCd === "000" && umdCd === "000" && riCd === "00";
};

const isSigunguItem = ({ sggCd, umdCd, riCd }) => {
  return sggCd !== "000" && umdCd === "000" && riCd === "00";
};

const mapApiItemToRegion = (item) => {
  const sidoCd = normalizeCode(item.sido_cd, 2);
  const sggCd = normalizeCode(item.sgg_cd, 3);
  const umdCd = normalizeCode(item.umd_cd, 3);
  const riCd = normalizeCode(item.ri_cd, 2);

  const fullName = String(item.locatadd_nm || "").trim();
  const lowestName = String(item.locallow_nm || "").trim();

  if (!sidoCd || !fullName) {
    return null;
  }

  if (isTopLevelRegionName(lowestName)) {
    return {
      regionCode: sidoCd,
      name: lowestName,
      level: 1,
      parentCode: null,
    };
  }

  if (isSidoItem({ sggCd, umdCd, riCd })) {
    return {
      regionCode: sidoCd,
      name: fullName,
      level: 1,
      parentCode: null,
    };
  }

  if (isSigunguItem({ sggCd, umdCd, riCd })) {
    return {
      regionCode: `${sidoCd}${sggCd}`,
      name: lowestName,
      level: 2,
      parentCode: sidoCd,
    };
  }

  return null;
};

const extractItemsFromResponse = (data) => {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    const rowSection = data.find((item) => Array.isArray(item?.row));
    return rowSection?.row || [];
  }

  if (Array.isArray(data?.StanReginCd)) {
    const rowSection = data.StanReginCd.find((item) =>
      Array.isArray(item?.row),
    );
    return rowSection?.row || [];
  }

  if (Array.isArray(data?.response?.body?.items?.item)) {
    return data.response.body.items.item;
  }

  if (Array.isArray(data?.response?.body?.items)) {
    return data.response.body.items;
  }

  if (Array.isArray(data?.items?.item)) {
    return data.items.item;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
};

const extractMetaFromResponse = (data) => {
  if (Array.isArray(data)) {
    const headSection = data.find((item) => Array.isArray(item?.head));
    const resultInfo = headSection?.head?.[1]?.RESULT || {};
    const listInfo = headSection?.head?.[0]?.list_total_count || 0;

    return {
      totalCount: Number(listInfo || 0),
      pageNo: 1,
      numOfRows: 0,
      resultCode: resultInfo.CODE || null,
      resultMsg: resultInfo.MESSAGE || null,
    };
  }

  if (Array.isArray(data?.StanReginCd)) {
    const headSection = data.StanReginCd.find((item) =>
      Array.isArray(item?.head),
    );
    const resultInfo = headSection?.head?.[1]?.RESULT || {};
    const listInfo = headSection?.head?.[0]?.list_total_count || 0;

    return {
      totalCount: Number(listInfo || 0),
      pageNo: 1,
      numOfRows: 0,
      resultCode: resultInfo.CODE || null,
      resultMsg: resultInfo.MESSAGE || null,
    };
  }

  const body = data?.response?.body || data || {};

  return {
    totalCount: Number(body.totalCount || 0),
    pageNo: Number(body.pageNo || 1),
    numOfRows: Number(body.numOfRows || 0),
    resultCode: body.resultCode || data?.resultCode || null,
    resultMsg: body.resultMsg || data?.resultMsg || null,
  };
};

const fetchLegalRegionPage = async ({ pageNo, numOfRows }) => {
  const params = {
    serviceKey: SERVICE_KEY,
    pageNo,
    numOfRows,
    type: "json",
  };

  const { data } = await axios.get(API_URL, {
    params,
  });

  return data;
};

const deduplicateRegions = (regions) => {
  const uniqueMap = new Map();

  regions.forEach((region) => {
    if (!region?.regionCode) {
      return;
    }

    uniqueMap.set(region.regionCode, region);
  });

  return [...uniqueMap.values()];
};

export const syncLegalRegions = async () => {
  validateLegalRegionConfig();

  const numOfRows = 1000;
  let pageNo = 1;
  let totalCount = 0;
  let rawItems = [];

  while (true) {
    const data = await fetchLegalRegionPage({
      pageNo,
      numOfRows,
    });

    const meta = extractMetaFromResponse(data);
    const items = extractItemsFromResponse(data);

    if (pageNo === 1) {
      totalCount = meta.totalCount;
    }

    rawItems = [...rawItems, ...items];

    if (items.length === 0) {
      break;
    }

    if (totalCount > 0 && rawItems.length >= totalCount) {
      break;
    }

    if (items.length < numOfRows) {
      break;
    }

    pageNo += 1;
  }

  const mappedRegions = rawItems.map(mapApiItemToRegion).filter(Boolean);
  const uniqueRegions = deduplicateRegions(mappedRegions);
  const sortedRegions = [...uniqueRegions].sort((a, b) => a.level - b.level);

  let successCount = 0;
  let failedCount = 0;

  for (const region of sortedRegions) {
    try {
      await upsertRegion(region);
      successCount += 1;
    } catch (error) {
      failedCount += 1;
      console.error(
        `[legal region sync] 저장 실패: ${region.name} (${region.regionCode}) - ${error.message}`,
      );
    }
  }

  const result = {
    totalCount,
    processedCount: sortedRegions.length,
    successCount,
    failedCount,
    message: "법정동 지역 동기화 완료",
  };

  console.log(
    `[legal region sync] 원본 ${result.totalCount}건 중 처리 ${result.processedCount}건, 성공 ${result.successCount}건, 실패 ${result.failedCount}건`,
  );

  return result;
};
