import { formatInTimeZone } from 'date-fns-tz';
import { enUS } from 'date-fns/locale';

export const formatToWIB = (date: string | Date, formatString: string = 'dd MMM yyyy, HH:mm:ss'): string => {
  if (!date) return 'N/A';
  try {
    return formatInTimeZone(date, 'Asia/Jakarta', formatString, { locale: enUS });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

// Format date to WIB with Indonesian format
export const formatToWIBID = (date: string | Date): string => {
  if (!date) return 'N/A';
  try {
    return formatInTimeZone(date, 'Asia/Jakarta', 'dd MMM yyyy, HH:mm:ss');
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

// Format date only (without time) in WIB
export const formatDateOnlyWIB = (date: string | Date): string => {
  if (!date) return 'N/A';
  try {
    return formatInTimeZone(date, 'Asia/Jakarta', 'dd MMM yyyy');
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

// Format time only in WIB
export const formatTimeOnlyWIB = (date: string | Date): string => {
  if (!date) return 'N/A';
  try {
    return formatInTimeZone(date, 'Asia/Jakarta', 'HH:mm:ss');
  } catch (error) {
    console.error("Error formatting time:", error);
    return 'Invalid Time';
  }
};
