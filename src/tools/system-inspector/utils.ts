import { UAParser } from 'ua-parser-js';
import type {
  BrowserInfo,
  HardwareInfo,
  StorageInfo,
  StorageStats,
  BatteryInfo,
  SystemInfo,
  PrivacyTip,
} from './types';

/**
 * 解析浏览器信息
 */
export function parseBrowserInfo(): BrowserInfo {
  const parser = new UAParser();
  const result = parser.getResult();
  const browser = result.browser;
  const engine = result.engine;
  const os = result.os;

  return {
    browserName: browser.name || '未知',
    browserVersion: browser.version || '未知',
    userAgent: navigator.userAgent,
    engine: engine.name || '未知',
    engineVersion: engine.version || '未知',
    language: navigator.language,
    languages: [...navigator.languages],
    touchSupported: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    cookiesEnabled: navigator.cookieEnabled,
    localStorageSupported: checkLocalStorageSupport(),
    sessionStorageSupported: checkSessionStorageSupport(),
    doNotTrack: navigator.doNotTrack === '1',
    platform: os.name ? `${os.name} ${os.version || ''}`.trim() : navigator.platform,
  };
}

/**
 * 检查 LocalStorage 支持
 */
function checkLocalStorageSupport(): boolean {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查 SessionStorage 支持
 */
function checkSessionStorageSupport(): boolean {
  try {
    const testKey = '__test__';
    sessionStorage.setItem(testKey, testKey);
    sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取 GPU 信息 (通过 WebGL)
 * 注意：这是浏览器能获取到的最真实的硬件名称之一
 */
export function getGPUInfo(): string | null {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return null;

    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return null;

    // 获取真实的 GPU 渲染器名称，例如 "NVIDIA GeForce RTX 3060"
    const renderer = (gl as WebGLRenderingContext).getParameter(
      debugInfo.UNMASKED_RENDERER_WEBGL
    );

    return renderer || null;
  } catch {
    return null;
  }
}

/**
 * 智能修正物理分辨率
 * 由于浏览器会将逻辑分辨率取整，反推物理分辨率时可能产生 ±1 像素的误差
 *
 * 例如：2560×1440 显示器 @ 150% 缩放
 * - 真实逻辑宽度: 2560 / 1.5 = 1706.666...
 * - 浏览器报告: 1707 (四舍五入)
 * - 反推物理宽度: 1707 * 1.5 = 2560.5 → 2561 (误差 +1)
 *
 * @param raw - 原始计算值（可能有小数）
 * @returns 修正后的分辨率字符串
 */
function correctPhysicalResolution(raw: number): string {
  const rounded = Math.round(raw);

  // 常见的标准分辨率列表
  const commonResolutions = [
    1920, 2560, 3840, // 1080p, 2K, 4K 横向
    1080, 1440, 2160, // 对应纵向
    1280, 1600, 1366, 768, // 其他常见分辨率
  ];

  // 如果计算值与取整值的差距小于 1，检查是否接近标准分辨率
  const decimal = Math.abs(raw - rounded);
  if (decimal > 0.3 && decimal < 0.7) {
    // 检查是否接近某个标准分辨率（容差 ±2）
    for (const standard of commonResolutions) {
      if (Math.abs(raw - standard) <= 2) {
        return `${standard} (修正自 ${raw.toFixed(1)})`;
      }
    }
  }

  // 如果原始值有明显小数部分，显示出来
  if (Math.abs(raw - rounded) > 0.01) {
    return `${rounded} (原始值 ${raw.toFixed(1)})`;
  }

  return `${rounded}`;
}

/**
 * 获取硬件信息
 */
export function getHardwareInfo(): HardwareInfo {
  const parser = new UAParser();
  const os = parser.getOS();

  const logicalWidth = window.screen.width;
  const logicalHeight = window.screen.height;
  const dpr = window.devicePixelRatio || 1;

  // 计算物理分辨率（保留原始浮点值）
  const rawPhysicalWidth = logicalWidth * dpr;
  const rawPhysicalHeight = logicalHeight * dpr;

  // 智能修正
  const physicalWidthStr = correctPhysicalResolution(rawPhysicalWidth);
  const physicalHeightStr = correctPhysicalResolution(rawPhysicalHeight);

  return {
    os: os.name || '未知',
    osVersion: os.version || '未知',
    screenResolution: `${logicalWidth} × ${logicalHeight}`,
    physicalResolution: `${physicalWidthStr} × ${physicalHeightStr}`,
    devicePixelRatio: dpr,
    cpuCores: navigator.hardwareConcurrency || 1,
    deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory || null,
    gpu: getGPUInfo(),
    battery: null, // 电池信息需要异步获取
  };
}

/**
 * 异步获取电池信息
 */
export async function getBatteryInfo(): Promise<BatteryInfo | null> {
  try {
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<{
        charging: boolean;
        level: number;
        chargingTime: number;
        dischargingTime: number;
      }>;
    };

    if (!nav.getBattery) {
      return null;
    }

    const battery = await nav.getBattery();
    return {
      charging: battery.charging,
      level: Math.round(battery.level * 100),
      chargingTime: battery.chargingTime === Infinity ? null : battery.chargingTime,
      dischargingTime: battery.dischargingTime === Infinity ? null : battery.dischargingTime,
    };
  } catch {
    return null;
  }
}

/**
 * 获取存储统计信息
 */
export function getStorageInfo(): StorageInfo {
  return {
    cookies: getCookieStats(),
    localStorage: getLocalStorageStats(),
    sessionStorage: getSessionStorageStats(),
  };
}

/**
 * 获取 Cookie 统计
 */
function getCookieStats(): StorageStats {
  const cookies = document.cookie;
  if (!cookies) {
    return { count: 0, size: 0, keys: [], items: {} };
  }

  const pairs = cookies.split(';').map(c => c.trim()).filter(Boolean);
  const keys: string[] = [];
  const items: Record<string, string> = {};

  pairs.forEach(pair => {
    const [key, ...valueParts] = pair.split('=');
    const value = valueParts.join('='); // 处理值中可能包含 '=' 的情况
    keys.push(key);
    items[key] = value;
  });

  const size = new Blob([cookies]).size;

  return { count: pairs.length, size, keys, items };
}

/**
 * 获取 LocalStorage 统计
 */
function getLocalStorageStats(): StorageStats {
  try {
    const keys = Object.keys(localStorage);
    const items: Record<string, string> = {};
    let totalSize = 0;

    for (const key of keys) {
      const value = localStorage.getItem(key) || '';
      items[key] = value;
      totalSize += key.length + value.length;
    }

    // 字符按 UTF-16 编码，每个字符 2 字节
    return { count: keys.length, size: totalSize * 2, keys, items };
  } catch {
    return { count: 0, size: 0, keys: [], items: {} };
  }
}

/**
 * 获取 SessionStorage 统计
 */
function getSessionStorageStats(): StorageStats {
  try {
    const keys = Object.keys(sessionStorage);
    const items: Record<string, string> = {};
    let totalSize = 0;

    for (const key of keys) {
      const value = sessionStorage.getItem(key) || '';
      items[key] = value;
      totalSize += key.length + value.length;
    }

    return { count: keys.length, size: totalSize * 2, keys, items };
  } catch {
    return { count: 0, size: 0, keys: [], items: {} };
  }
}

/**
 * 格式化文件大小
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

/**
 * 格式化时间
 */
export function formatTime(seconds: number | null): string {
  if (seconds === null) return '未知';
  if (seconds === 0) return '已满';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`;
  }
  return `${minutes}分钟`;
}

/**
 * 导出系统信息为 JSON
 */
export function exportSystemInfo(info: SystemInfo): string {
  return JSON.stringify(info, null, 2);
}

/**
 * 隐私提示信息
 */
export const PRIVACY_TIPS: Record<string, PrivacyTip> = {
  network: {
    title: '网络信息隐私说明',
    description: '您的 IP 地址和 HTTP 请求头在每次网络请求时都会发送给服务器，这是互联网通信的基本机制。网站可以通过 IP 推断您的大致地理位置。',
  },
  hardware: {
    title: '硬件信息隐私说明 ⚠️ 重要提示',
    description: '浏览器获取的硬件信息存在精度限制和隐私保护：\n1) 屏幕分辨率是逻辑像素（受缩放影响），物理分辨率是估算值；\n2) CPU 核心数是逻辑线程数（超线程会翻倍），部分浏览器会限制最大值；\n3) 内存只能返回 0.25/0.5/1/2/4/8 这几个固定值，即使您有 32GB 内存也只显示 8GB；\n4) GPU 信息通过 WebGL 获取，是较准确的硬件名称；\n5) 操作系统基于 User-Agent，可被伪造或简化（如 Windows 11 可能显示为 Windows 10）。',
  },
  resolution: {
    title: '分辨率计算精度说明 📐',
    description: '物理分辨率通过"逻辑像素 × DPR"反推，但浏览器会将逻辑分辨率取整，导致计算误差。例如：2560×1440 显示器 @ 150% 缩放时，真实逻辑宽度是 1706.666...，但浏览器报告 1707（四舍五入），反推得 2560.5 → 2561（差 1 像素）。这是"精度丢失"的经典案例，展示了浮点数运算的不可逆性。如看到"修正自"字样，说明工具检测到误差并修正到标准分辨率。',
  },
  browser: {
    title: '浏览器环境隐私说明',
    description: 'User Agent 和浏览器特性是网页兼容性检测的基础。这些信息可用于浏览器指纹识别，但也是确保网页正常显示的必要数据。现代浏览器正在推行 UA Reduction（简化 User Agent）以减少指纹追踪。',
  },
  storage: {
    title: '存储数据隐私说明',
    description: 'Cookie 和本地存储用于保存用户偏好和会话信息。第三方网站无法访问其他域名的存储数据，这是浏览器的同源策略保护。',
  },
  battery: {
    title: '电池 API 隐私说明 ⚠️ 已废弃',
    description: '由于电池充电速率和剩余电量可用于高精度用户追踪（电池指纹），Firefox 已彻底删除此 API，Chrome 也在降低精度。这是隐私保护的必要措施。',
  },
};
