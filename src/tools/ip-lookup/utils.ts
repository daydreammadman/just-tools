/**
 * IP 查询工具函数
 */

// IPv4 正则表达式
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

// IPv6 正则表达式 (简易版)
const IPV6_REGEX = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i;

/**
 * 验证 IP 地址格式是否有效
 * @param ip - 待验证的 IP 字符串
 * @returns boolean
 */
export function validateIp(ip: string): boolean {
  if (!ip) return false;
  const trimmed = ip.trim();
  return IPV4_REGEX.test(trimmed) || IPV6_REGEX.test(trimmed);
}

/**
 * 格式化经纬度显示
 * @param lat 纬度
 * @param lon 经度
 */
export function formatCoordinates(lat?: number, lon?: number): string {
  if (lat === undefined || lon === undefined) return '未知';
  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}