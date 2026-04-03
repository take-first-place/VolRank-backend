// 날짜 파싱 함수 (API의 날짜와 시간을 MySQL DATETIME 포맷으로 변환하는 함수)
export const parseDate = (dateStr, timeStr = '00') => {
    if (!dateStr) return null;

    // 문자열로 변환
    const str = String(dateStr);

    const year = str.slice(0, 4);
    const month = str.slice(4, 6);
    const day = str.slice(6, 8);

    // 시간 형식 2자리로 보정 (9 -> 09)
    const hour = String(timeStr).padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:00:00`;
};

