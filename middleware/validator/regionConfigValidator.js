const createConfigError = (message) => {
  const error = new Error(message);
  error.status = 500;
  return error;
};

export const externalRegionConfigValidator = () => {
  const baseUrl = process.env.V1365_API_BASE_URL;
  const serviceKey = process.env.V1365_API_KEY;
  const regionListPath = process.env.REGION_LIST_PATH;

  if (!baseUrl) {
    throw createConfigError("V1365_API_BASE_URL이 설정되지 않았습니다.");
  }

  if (!serviceKey) {
    throw createConfigError("V1365_API_KEY가 설정되지 않았습니다.");
  }

  if (!regionListPath) {
    throw createConfigError("REGION_LIST_PATH가 설정되지 않았습니다.");
  }

  return {
    baseUrl,
    serviceKey,
    regionListPath,
  };
};
