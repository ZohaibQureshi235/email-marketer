interface FormatOptions {
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  hour12?: boolean;
  timeZone?: string;
}

/**
 * Convert UTC timestamp to current browser timezone
 */
export function convertToCurrentTimezone(utcDate: string | Date): Date {
  const date = new Date(utcDate);
  const timezoneOffset = new Date().getTimezoneOffset(); // in minutes
  return new Date(date.getTime() - (timezoneOffset * 60 * 1000));
}

/**
 * Format date to current timezone string
 */
export function formatToCurrentTimezone(
  utcDate: string | Date, 
  options: FormatOptions = {}
): string {
  const localDate = convertToCurrentTimezone(utcDate);
  
  const defaultOptions: FormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: true,
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  return new Intl.DateTimeFormat('en-US', formatOptions).format(localDate);
}

/**
 * Get current timezone offset as string
 */
export function getTimezoneOffsetString(): string {
  const offset = new Date().getTimezoneOffset();
  const sign = offset > 0 ? '-' : '+';
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Get current timezone name
 */
export function getCurrentTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    return `UTC${getTimezoneOffsetString()}`;
  }
}

/**
 * Format options for the component
 */
export interface DateTimeFormat {
  date?: boolean;
  time?: boolean;
  format?: 'default' | 'iso-local' | 'short' | 'time' | 'relative';
  hour12?: boolean;
}

/**
 * Main formatting function
 */
export function formatDateTime(
  date: string | Date, 
  options: DateTimeFormat = {}
): string {
  const {
    date: showDate = true,
    time: showTime = true,
    format = 'default',
    hour12 = true,
  } = options;

  const localDate = convertToCurrentTimezone(date);
  
  switch (format) {
    case 'iso-local':
      const pad = (num: number) => String(num).padStart(2, '0');
      const dateStr = `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())}`;
      const timeStr = `${pad(localDate.getHours())}:${pad(localDate.getMinutes())}`;
      return `${dateStr} ${timeStr}`;
    
    case 'short':
      return localDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    
    case 'time':
      return localDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12,
      });
    
    case 'relative':
      return getRelativeTime(date);
    
    case 'default':
    default:
      if (showDate && showTime) {
        return localDate.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12,
        });
      } else if (showDate) {
        return localDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } else {
        return localDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12,
        });
      }
  }
}

/**
 * Get relative time string
 */
export function getRelativeTime(date: string | Date): string {
  const localDate = convertToCurrentTimezone(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - localDate.getTime()) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return count === 1 
        ? `1 ${interval.label} ago` 
        : `${count} ${interval.label}s ago`;
    }
  }
  
  return 'just now';
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
  const localDate = convertToCurrentTimezone(date);
  const today = new Date();
  
  return localDate.getDate() === today.getDate() &&
    localDate.getMonth() === today.getMonth() &&
    localDate.getFullYear() === today.getFullYear();
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: string | Date): boolean {
  const localDate = convertToCurrentTimezone(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return localDate.getDate() === yesterday.getDate() &&
    localDate.getMonth() === yesterday.getMonth() &&
    localDate.getFullYear() === yesterday.getFullYear();
}