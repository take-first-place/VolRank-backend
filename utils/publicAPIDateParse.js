export const parseDate = (dateStr) => {
    if (!dateStr) return null;

    const str = String(dateStr);

    const year = str.slice(0, 4);
    const month = str.slice(4, 6);
    const day = str.slice(6, 8);
    const hour = str.slice(8, 10) || '00';
    const min = str.slice(10, 12) || '00';

    return `${year}-${month}-${day} ${hour}:${min}:00`;
}