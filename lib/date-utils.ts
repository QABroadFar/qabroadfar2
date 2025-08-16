import { formatInTimeZone } from 'date-fns-tz';

export const formatToWIB = (date: string | Date, formatString: string = 'dd MMM yyyy, HH:mm:ss'): string => {
  if (!date) return 'N/A';
  try {
    return formatInTimeZone(date, 'Asia/Jakarta', formatString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};
