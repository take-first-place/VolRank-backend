export const TOP_LEVEL_REGION_SUFFIXES = [
  "특별시",
  "광역시",
  "특별자치시",
  "도",
  "특별자치도",
];

export const isTopLevelRegionName = (name = "") => {
  return TOP_LEVEL_REGION_SUFFIXES.some((suffix) => name.endsWith(suffix));
};

export const isSameMeaningLowerRegionName = ({
  topLevelName = "",
  lowerRegionName = "",
}) => {
  const normalizedTopLevelName = String(topLevelName).trim();
  const normalizedLowerRegionName = String(lowerRegionName).trim();

  if (!normalizedTopLevelName || !normalizedLowerRegionName) {
    return false;
  }

  if (!isTopLevelRegionName(normalizedTopLevelName)) {
    return false;
  }

  const baseTopLevelName = normalizedTopLevelName
    .replace(/특별자치시$/, "")
    .replace(/특별시$/, "")
    .replace(/광역시$/, "")
    .replace(/특별자치도$/, "")
    .replace(/도$/, "");

  const baseLowerRegionName = normalizedLowerRegionName
    .replace(/시$/, "")
    .replace(/군$/, "")
    .replace(/구$/, "");

  return baseTopLevelName === baseLowerRegionName;
};
