/**
 * 时间戳类型
 */
export type TimestampUnit = 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds';

/**
 * 日期格式类型
 */
export type DateFormat =
  | 'iso'
  | 'full'
  | 'date-only'
  | 'time-only'
  | 'custom';

/**
 * 检测时间戳类型
 * @param timestamp - 时间戳字符串或数字
 * @returns 时间戳单位
 */
export function detectTimestampUnit(timestamp: string | number): TimestampUnit {
  const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;

  if (isNaN(ts)) {
    throw new Error('Invalid timestamp');
  }

  const length = Math.abs(ts).toString().length;

  if (length <= 10) {
    return 'seconds';
  } else if (length <= 13) {
    return 'milliseconds';
  } else if (length <= 16) {
    return 'microseconds';
  } else {
    return 'nanoseconds';
  }
}

/**
 * 标准化时间戳为毫秒
 * @param timestamp - 时间戳
 * @param unit - 时间戳单位
 * @returns 毫秒级时间戳
 */
export function normalizeToMilliseconds(timestamp: number, unit: TimestampUnit): number {
  switch (unit) {
    case 'seconds':
      return timestamp * 1000;
    case 'milliseconds':
      return timestamp;
    case 'microseconds':
      return timestamp / 1000;
    case 'nanoseconds':
      return timestamp / 1000000;
    default:
      return timestamp;
  }
}

/**
 * 将毫秒时间戳转换为指定单位
 * @param milliseconds - 毫秒时间戳
 * @param unit - 目标单位
 * @returns 转换后的时间戳
 */
export function convertFromMilliseconds(milliseconds: number, unit: TimestampUnit): number {
  switch (unit) {
    case 'seconds':
      return Math.floor(milliseconds / 1000);
    case 'milliseconds':
      return milliseconds;
    case 'microseconds':
      return milliseconds * 1000;
    case 'nanoseconds':
      return milliseconds * 1000000;
    default:
      return milliseconds;
  }
}

/**
 * 时间戳转日期时间
 * @param timestamp - 时间戳
 * @param unit - 时间戳单位
 * @param format - 日期格式
 * @returns 格式化的日期时间字符串
 */
export function timestampToDate(
  timestamp: string | number,
  unit: TimestampUnit = 'milliseconds',
  format: DateFormat = 'full'
): string {
  const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;

  if (isNaN(ts)) {
    throw new Error('Invalid timestamp');
  }

  const milliseconds = normalizeToMilliseconds(ts, unit);
  const date = new Date(milliseconds);

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  return formatDate(date, format);
}

/**
 * 日期时间转时间戳
 * @param dateString - 日期时间字符串
 * @param unit - 目标时间戳单位
 * @returns 时间戳
 */
export function dateToTimestamp(dateString: string, unit: TimestampUnit = 'milliseconds'): number {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date string');
  }

  const milliseconds = date.getTime();
  return convertFromMilliseconds(milliseconds, unit);
}

/**
 * 格式化日期
 * @param date - Date 对象
 * @param format - 日期格式
 * @returns 格式化的日期字符串
 */
export function formatDate(date: Date, format: DateFormat): string {
  switch (format) {
    case 'iso':
      return date.toISOString();

    case 'full':
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

    case 'date-only':
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

    case 'time-only':
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

    case 'custom':
      // 自定义格式：YYYY-MM-DD HH:mm:ss
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    default:
      return date.toString();
  }
}

/**
 * 获取当前时间戳
 * @param unit - 时间戳单位
 * @returns 当前时间戳
 */
export function getCurrentTimestamp(unit: TimestampUnit = 'milliseconds'): number {
  const now = Date.now();
  return convertFromMilliseconds(now, unit);
}

/**
 * 验证时间戳
 * @param timestamp - 时间戳字符串
 * @returns 是否有效
 */
export function isValidTimestamp(timestamp: string): boolean {
  if (!timestamp || timestamp.trim() === '') {
    return false;
  }

  const ts = parseInt(timestamp, 10);

  if (isNaN(ts)) {
    return false;
  }

  // 检查是否在合理范围内（1970-01-01 到 2100-01-01）
  const unit = detectTimestampUnit(ts);
  const milliseconds = normalizeToMilliseconds(ts, unit);

  const minDate = new Date('1970-01-01').getTime();
  const maxDate = new Date('2100-01-01').getTime();

  return milliseconds >= minDate && milliseconds <= maxDate;
}

/**
 * 验证日期字符串
 * @param dateString - 日期字符串
 * @returns 是否有效
 */
export function isValidDateString(dateString: string): boolean {
  if (!dateString || dateString.trim() === '') {
    return false;
  }

  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * 批量转换时间戳
 * @param timestamps - 时间戳数组
 * @param unit - 时间戳单位
 * @param format - 日期格式
 * @returns 转换结果数组
 */
export function batchTimestampToDate(
  timestamps: string[],
  unit: TimestampUnit,
  format: DateFormat
): Array<{ input: string; output: string; error?: string }> {
  return timestamps.map((ts) => {
    try {
      const result = timestampToDate(ts, unit, format);
      return { input: ts, output: result };
    } catch (error) {
      return {
        input: ts,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });
}

/**
 * 获取相对时间描述
 * @param timestamp - 时间戳
 * @param unit - 时间戳单位
 * @returns 相对时间描述（如"3分钟前"）
 */
export function getRelativeTime(timestamp: number, unit: TimestampUnit): string {
  const milliseconds = normalizeToMilliseconds(timestamp, unit);
  const now = Date.now();
  const diff = now - milliseconds;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return `${seconds}秒前`;
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 30) {
    return `${days}天前`;
  } else if (months < 12) {
    return `${months}个月前`;
  } else {
    return `${years}年前`;
  }
}
