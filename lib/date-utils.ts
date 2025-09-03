import { formatInTimeZone } from 'date-fns-tz';
import { enUS } from 'date-fns/locale';

export const formatToWIB = (date: string | Date, formatString: string = 'dd MMM yyyy, HH:mm:ss'): string => {
  if (!date) return 'N/A';
  try {
    // Handle different input formats
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // If it's already an ISO string, it might be in UTC
      if (date.endsWith('Z') || date.includes('+') || date.includes('T')) {
        // Parse as UTC and directly format to WIB
        dateObj = new Date(date);
      } else {
        // Assume it's already in local time
        dateObj = new Date(date);
      }
    } else {
      dateObj = date;
    }
    
    return formatInTimeZone(dateObj, 'Asia/Jakarta', formatString, { locale: enUS });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

// Format date to WIB with Indonesian format
export const formatToWIBID = (date: string | Date): string => {
  if (!date) return 'N/A';
  try {
    return formatToWIB(date, 'dd MMM yyyy, HH:mm:ss');
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

// Format date only (without time) in WIB
export const formatDateOnlyWIB = (date: string | Date): string => {
  if (!date) return 'N/A';
  try {
    return formatToWIB(date, 'dd MMM yyyy');
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

// Format time only in WIB
export const formatTimeOnlyWIB = (date: string | Date): string => {
  if (!date) return 'N/A';
  try {
    return formatToWIB(date, 'HH:mm:ss');
  } catch (error) {
    console.error("Error formatting time:", error);
    return 'Invalid Time';
  }
};
