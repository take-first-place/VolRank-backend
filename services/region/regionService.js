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

const findMatchedChildRegion = ({ candidates, parentCode, sigunguMap }) => {
  for (const candidate of candidates) {
    const matchedRegion = sigunguMap.get(`${parentCode}:${candidate}`);

    if (matchedRegion) {
      return matchedRegion;
    }
  }

  return null;
};

export const resolveRegionFromLocationText = (locationText, regionCache) => {
  const { sidoMap, sigunguMap } = regionCache;
  const sourceText = normalizeLocationText(locationText);
  const tokens = splitLocationTokens(locationText);

  if (tokens.length === 0) {
    return buildResolveResult({ region: null, sourceText: "" });
  }

  const firstToken = normalizeSidoName(tokens[0]);
  const secondToken = tokens[1] || null;
  const thirdToken = tokens[2] || null;

  // 1) 첫 토큰은 시/도
  const sido = sidoMap.get(firstToken);

  if (!sido) {
    return buildResolveResult({ region: null, sourceText });
  }

  // 2) 시/도만 있으면 시/도 반환
  if (!secondToken) {
    return buildResolveResult({ region: sido, sourceText });
  }

  // 3) 둘째 토큰은 시/도의 직속 자식
  const secondCandidates = buildChildRegionCandidates(secondToken);

  const childRegion = findMatchedChildRegion({
    candidates: secondCandidates,
    parentCode: sido.region_code,
    sigunguMap,
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

  const grandChildRegion = findMatchedChildRegion({
    candidates: thirdCandidates,
    parentCode: childRegion.region_code,
    sigunguMap,
  });

  return buildResolveResult({
    region: grandChildRegion || childRegion,
    sourceText,
  });
};

export const buildRegionCache = (regions) => {
  const sidoMap = new Map();
  const sigunguMap = new Map();

  for (const region of regions) {
    if (Number(region.level) === 1) {
      sidoMap.set(region.name, region);
    }

    if (Number(region.level) === 2) {
      sigunguMap.set(`${region.parent_code}:${region.name}`, region);
    }
  }

  return { sidoMap, sigunguMap };
};
