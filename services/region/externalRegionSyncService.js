import axios from "axios";
import {
  findSidoByName,
  findChildRegionByNameAndParentCode,
  findDescendantRegionByNameUnderSido,
} from "../../model/region/regionModel.js";
import { saveExternalRegionMapping } from "../../model/region/externalRegionMappingModel.js";
import { buildChildRegionCandidates } from "../../utils/regionLocationParser.js";

const REGION_API_BASE_URL = process.env.V1365_API_BASE_URL;
const REGION_API_SERVICE_KEY = process.env.V1365_API_KEY;
const REGION_LIST_PATH = process.env.REGION_LIST_PATH;

const CODE_INQUIRY_URL = `${REGION_API_BASE_URL?.replace(/\/$/, "")}/${REGION_LIST_PATH?.replace(/^\//, "")}`;

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

  for (const candidate of candidates) {
    const descendant = await findDescendantRegionByNameUnderSido({
      name: candidate,
      sidoCode,
    });

    if (descendant) {
      return descendant;
    }
  }

  return null;
};

const syncOneRegionItem = async (item) => {
  const sidoCd = normalizeText(item.sidoCd);
  const sidoNm = normalizeText(item.sidoNm);
  const gugunCd = normalizeText(item.gugunCd);
  const gugunNm = normalizeText(item.gugunNm);

  if (!sidoCd || !sidoNm) {
    return;
  }

  const sido = await findSidoByName(sidoNm);

  if (!sido) {
    console.warn(`[1365 sync] 시도 매핑 실패: ${sidoNm} (${sidoCd})`);
    return;
  }

  await saveExternalRegionMapping({
    externalRegionCode: sidoCd,
    externalRegionName: sidoNm,
    regionCode: sido.region_code,
  });

  if (!gugunCd || !gugunNm) {
    return;
  }

  const matchedRegion = await findMatchedRegionUnderSido({
    gugunNm,
    sidoCode: sido.region_code,
  });

  if (!matchedRegion) {
    console.warn(
      `[1365 sync] 시군구 매핑 실패: ${sidoNm} ${gugunNm} (${gugunCd})`,
    );
    return;
  }

  await saveExternalRegionMapping({
    externalRegionCode: gugunCd,
    externalRegionName: gugunNm,
    regionCode: matchedRegion.region_code,
  });
};

const fetch1365RegionPage = async ({ pageNo, numOfRows }) => {
  const { data } = await axios.get(CODE_INQUIRY_URL, {
    params: {
      serviceKey: REGION_API_SERVICE_KEY,
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
  if (!REGION_API_BASE_URL) {
    const error = new Error("V1365_API_BASE_URL이 설정되지 않았습니다.");
    error.status = 500;
    throw error;
  }

  if (!REGION_API_SERVICE_KEY) {
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

  while (true) {
    const data = await fetch1365RegionPage({ pageNo, numOfRows });

    const items = extractItems(data);
    totalCount = extractTotalCount(data);

    if (items.length === 0) {
      break;
    }

    for (const item of items) {
      await syncOneRegionItem(item);
      processedCount += 1;
    }

    if (pageNo * numOfRows >= totalCount) {
      break;
    }

    pageNo += 1;
  }

  return {
    totalCount,
    processedCount,
    message: "1365 지역코드 매핑 동기화 완료",
  };
};
