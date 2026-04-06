import axios from "axios";
import {
  findSidoByName,
  findChildRegionByNameAndParentCode,
} from "../../model/region/regionModel.js";
import { saveExternalRegionMapping } from "../../model/region/externalRegionMappingModel.js";
import { buildChildRegionCandidates } from "../../utils/regionLocationParser.js";
import { isSameMeaningLowerRegionName } from "../../utils/regionNameRules.js";
import { externalRegionConfigValidator } from "../../middleware/validator/regionConfigValidator.js";

const SYNC_STATUS = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
};

const normalizeText = (value) => String(value || "").trim();

const buildCodeInquiryUrl = ({ baseUrl, regionListPath }) => {
  return `${baseUrl.replace(/\/$/, "")}/${regionListPath.replace(/^\//, "")}`;
};

const extractTotalCount = (data) => {
  return Number(data?.response?.body?.totalCount || 0);
};

const extractItems = (data) => {
  const items = data?.response?.body?.items?.item || [];
  return Array.isArray(items) ? items : [items];
};

const extractExternalRegionItem = (item) => {
  const sidoName = normalizeText(item?.sidoNm || item?.sido_nm);
  const sigunguName = normalizeText(item?.gugunNm || item?.gugun_nm);
  const externalRegionCode = normalizeText(
    item?.code || item?.regionCode || item?.gugunCd,
  );

  return {
    sidoName,
    sigunguName,
    externalRegionCode,
  };
};

// 특정 시도 아래에서 시군구 후보명을 순회하며 일치하는 지역을 찾는 함수
const findMatchedRegionUnderSido = async ({ sigunguName, sidoCode }) => {
  const candidates = buildChildRegionCandidates(sigunguName);

  for (const candidate of candidates) {
    const region = await findChildRegionByNameAndParentCode({
      name: candidate,
      parentCode: sidoCode,
    });

    if (region) {
      return region;
    }
  }

  return null;
};

// 외부 API의 시도/시군구명을 기준으로 내부 region 테이블의 지역 정보를 찾는 함수
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

  if (
    !normalizedSigunguName ||
    isSameMeaningLowerRegionName({
      topLevelName: normalizedSidoName,
      lowerRegionName: normalizedSigunguName,
    })
  ) {
    return sido;
  }

  const matchedRegion = await findMatchedRegionUnderSido({
    sigunguName: normalizedSigunguName,
    sidoCode: sido.region_code,
  });

  if (!matchedRegion) {
    console.log(
      `[1365 sync] 시군구 매핑 실패: ${normalizedSidoName} ${normalizedSigunguName}`,
    );
    return null;
  }

  return matchedRegion;
};

// 1365 지역코드 조회 API를 페이지 단위로 호출하는 함수
const fetch1365RegionPage = async ({
  pageNo,
  numOfRows,
  serviceKey,
  codeInquiryUrl,
}) => {
  const { data } = await axios.get(codeInquiryUrl, {
    params: {
      serviceKey,
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

// 외부 지역 item 1건을 내부 region과 매핑해 저장하는 함수
const syncOneRegionItem = async (item) => {
  const { sidoName, sigunguName, externalRegionCode } =
    extractExternalRegionItem(item);

  if (!externalRegionCode) {
    console.log("[1365 sync] 외부 코드 없음:", item);
    return SYNC_STATUS.FAILED;
  }

  const region = await resolveRegionFromExternalLocation({
    sidoName,
    sigunguName,
  });

  if (!region) {
    return SYNC_STATUS.FAILED;
  }

  await saveExternalRegionMapping({
    externalRegionCode,
    externalRegionName: `${sidoName} ${sigunguName}`.trim(),
    regionCode: region.region_code,
    isActive: true,
  });

  return SYNC_STATUS.SUCCESS;
};

const createSyncResult = () => {
  return {
    totalCount: 0,
    processedCount: 0,
    successCount: 0,
    failedCount: 0,
    message: "1365 지역코드 매핑 동기화 완료",
  };
};

// 단건 동기화 결과에 따라 성공/실패 카운트를 누적하는 함수
const updateSyncCounts = ({ result, status }) => {
  result.processedCount += 1;

  if (status === SYNC_STATUS.SUCCESS) {
    result.successCount += 1;
    return;
  }

  result.failedCount += 1;
};

// 1365 지역코드 전체 데이터를 조회하여 내부 region과 매핑 저장하는 메인 동기화 함수
export const sync1365RegionMappings = async () => {
  const { baseUrl, serviceKey, regionListPath } =
    externalRegionConfigValidator();

  const codeInquiryUrl = buildCodeInquiryUrl({
    baseUrl,
    regionListPath,
  });

  const numOfRows = 100;
  let pageNo = 1;
  const result = createSyncResult();

  while (true) {
    const data = await fetch1365RegionPage({
      pageNo,
      numOfRows,
      serviceKey,
      codeInquiryUrl,
    });

    const items = extractItems(data);
    result.totalCount = extractTotalCount(data);

    if (items.length === 0) {
      break;
    }

    for (const item of items) {
      const status = await syncOneRegionItem(item);
      updateSyncCounts({ result, status });
    }

    if (pageNo * numOfRows >= result.totalCount) {
      break;
    }

    pageNo += 1;
  }

  console.log(
    `[1365 region sync] 원본 ${result.totalCount}건 중 처리 ${result.processedCount}건, 성공 ${result.successCount}건, 실패 ${result.failedCount}건`,
  );

  return result;
};
