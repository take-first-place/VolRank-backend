import axios from "axios";
import {
  findSidoByName,
  findChildRegionByNameAndParentCode,
} from "../../model/region/regionModel.js";
import { saveExternalRegionMapping } from "../../model/region/externalRegionMappingModel.js";
import { buildChildRegionCandidates } from "../../utils/regionLocationParser.js";
import { isSameMeaningLowerRegionName } from "../../utils/regionNameRules.js";

const BASE_URL = process.env.V1365_API_BASE_URL;
const SERVICE_KEY = process.env.V1365_API_KEY;
const REGION_LIST_PATH = process.env.REGION_LIST_PATH;

const CODE_INQUIRY_URL = `${BASE_URL?.replace(/\/$/, "")}/${REGION_LIST_PATH?.replace(/^\//, "")}`;

const extractItems = (data) => {
  const items = data?.response?.body?.items?.item || [];
  return Array.isArray(items) ? items : [items];
};

const extractTotalCount = (data) => {
  return Number(data?.response?.body?.totalCount || 0);
};

const normalizeText = (value) => {
  if (!value) return "";
  return String(value).trim();
};

const findMatchedRegionUnderSido = async ({ gugunNm, sidoCode }) => {
  const candidates = buildChildRegionCandidates(gugunNm);

  for (const candidate of candidates) {
    const directChild = await findChildRegionByNameAndParentCode({
      name: candidate,
      parentCode: sidoCode,
    });

    if (directChild) {
      return directChild;
    }
  }

  return null;
};

const resolveRegionFromExternalLocation = async ({ sidoName, sigunguName }) => {
  const normalizedSidoName = normalizeText(sidoName);
  const normalizedSigunguName = normalizeText(sigunguName);

  if (!normalizedSidoName) {
    return null;
  }

  const sido = await findSidoByName(normalizedSidoName);

  if (!sido) {
    console.log(`[1365 sync] 시도 매핑 실패: ${normalizedSidoName}`);
    return null;
  }

  if (!normalizedSigunguName) {
    return {
      regionCode: sido.region_code,
      region: sido,
    };
  }

  if (
    isSameMeaningLowerRegionName({
      topLevelName: normalizedSidoName,
      lowerRegionName: normalizedSigunguName,
    })
  ) {
    return {
      regionCode: sido.region_code,
      region: sido,
    };
  }

  const matchedRegion = await findMatchedRegionUnderSido({
    gugunNm: normalizedSigunguName,
    sidoCode: sido.region_code,
  });

  if (!matchedRegion) {
    console.log(
      `[1365 sync] 시군구 매핑 실패: ${normalizedSidoName} ${normalizedSigunguName}`,
    );
    return null;
  }

  return {
    regionCode: matchedRegion.region_code,
    region: matchedRegion,
  };
};

const syncOneRegionItem = async (item) => {
  const sidoName = normalizeText(item.sidoNm || item.sido_nm);
  const sigunguName = normalizeText(item.gugunNm || item.gugun_nm);
  const externalRegionCode = normalizeText(
    item.code || item.regionCode || item.gugunCd,
  );

  if (!externalRegionCode) {
    console.log("[1365 sync] 외부 코드 없음:", item);
    return "FAILED";
  }

  const mappedRegion = await resolveRegionFromExternalLocation({
    sidoName,
    sigunguName,
  });

  if (!mappedRegion) {
    return "FAILED";
  }

  await saveExternalRegionMapping({
    externalRegionCode,
    externalRegionName: `${sidoName} ${sigunguName}`.trim(),
    regionCode: mappedRegion.regionCode,
    isActive: true,
  });

  return "SUCCESS";
};

const fetch1365RegionPage = async ({ pageNo, numOfRows }) => {
  const { data } = await axios.get(CODE_INQUIRY_URL, {
    params: {
      serviceKey: SERVICE_KEY,
      type: "json",
      pageNo,
      numOfRows,
    },
  });

  const resultCode = data?.response?.header?.resultCode;
  const resultMsg = data?.response?.header?.resultMsg;

  if (resultCode !== "00" && resultCode !== "0000") {
    const error = new Error(
      `1365 지역코드 조회 실패: ${resultCode} ${resultMsg}`,
    );
    error.status = 502;
    throw error;
  }

  return data;
};

export const sync1365RegionMappings = async () => {
  if (!BASE_URL) {
    const error = new Error("V1365_API_BASE_URL이 설정되지 않았습니다.");
    error.status = 500;
    throw error;
  }

  if (!SERVICE_KEY) {
    const error = new Error("V1365_API_KEY가 설정되지 않았습니다.");
    error.status = 500;
    throw error;
  }

  if (!REGION_LIST_PATH) {
    const error = new Error("REGION_LIST_PATH가 설정되지 않았습니다.");
    error.status = 500;
    throw error;
  }

  const numOfRows = 100;
  let pageNo = 1;
  let totalCount = 0;
  let processedCount = 0;
  let successCount = 0;
  let failedCount = 0;

  while (true) {
    const data = await fetch1365RegionPage({ pageNo, numOfRows });

    const items = extractItems(data);
    totalCount = extractTotalCount(data);

    if (items.length === 0) {
      break;
    }

    for (const item of items) {
      const result = await syncOneRegionItem(item);

      processedCount += 1;

      if (result === "SUCCESS") {
        successCount += 1;
      }

      if (result === "FAILED") {
        failedCount += 1;
      }
    }

    if (pageNo * numOfRows >= totalCount) {
      break;
    }

    pageNo += 1;
  }

  const result = {
    totalCount,
    processedCount,
    successCount,
    failedCount,
    message: "1365 지역코드 매핑 동기화 완료",
  };

  console.log(
    `[1365 region sync] 원본 ${result.totalCount}건 중 처리 ${result.processedCount}건, 성공 ${result.successCount}건, 실패 ${result.failedCount}건`,
  );

  return result;
};
