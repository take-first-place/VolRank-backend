import {
  findSidoByName,
  findChildRegionByNameAndParentCode,
} from "../../model/region/regionModel.js";
import {
  normalizeLocationText,
  normalizeSidoName,
  splitLocationTokens,
  buildChildRegionCandidates,
} from "../../utils/regionLocationParser.js";

const buildResolveResult = ({ region = null, sourceText = "" }) => {
  return {
    regionCode: region?.region_code || null,
    region,
    sourceText,
  };
};

const findMatchedChildRegion = async ({ candidates, parentCode }) => {
  for (const candidate of candidates) {
    const matchedRegion = await findChildRegionByNameAndParentCode({
      name: candidate,
      parentCode,
    });

    if (matchedRegion) {
      return matchedRegion;
    }
  }

  return null;
};

export const resolveRegionFromLocationText = async (locationText) => {
  const sourceText = normalizeLocationText(locationText);
  const tokens = splitLocationTokens(locationText);

  if (tokens.length === 0) {
    return buildResolveResult({ region: null, sourceText: "" });
  }

  const firstToken = normalizeSidoName(tokens[0]);
  const secondToken = tokens[1] || null;
  const thirdToken = tokens[2] || null;

  // 1) 첫 토큰은 시/도
  const sido = await findSidoByName(firstToken);

  if (!sido) {
    return buildResolveResult({ region: null, sourceText });
  }

  // 2) 시/도만 있으면 시/도 반환
  if (!secondToken) {
    return buildResolveResult({ region: sido, sourceText });
  }

  // 3) 둘째 토큰은 시/도의 직속 자식
  const secondCandidates = buildChildRegionCandidates(secondToken);

  const childRegion = await findMatchedChildRegion({
    candidates: secondCandidates,
    parentCode: sido.region_code,
  });

  if (!childRegion) {
    return buildResolveResult({ region: sido, sourceText });
  }

  // 4) 셋째 토큰이 없으면 둘째 토큰 매칭 결과 반환
  if (!thirdToken) {
    return buildResolveResult({ region: childRegion, sourceText });
  }

  // 5) 셋째 토큰은 둘째 토큰의 직속 자식
  const thirdCandidates = buildChildRegionCandidates(thirdToken);

  const grandChildRegion = await findMatchedChildRegion({
    candidates: thirdCandidates,
    parentCode: childRegion.region_code,
  });

  return buildResolveResult({
    region: grandChildRegion || childRegion,
    sourceText,
  });
};
