export const parseDate = (dateStr) => {
  if (!dateStr) return null;

  const str = String(dateStr);

  const year = str.slice(0, 4);
  const month = str.slice(4, 6);
  const day = str.slice(6, 8);

  return `${year}-${month}-${day}`;
};

export const parseHour = (timeStr) => {
  if (timeStr == null || timeStr === "") {
    return null;
  }

  const hour = Number(timeStr);

  if (Number.isNaN(hour) || hour < 0 || hour > 23) {
    return null;
  }

  return hour;
};
