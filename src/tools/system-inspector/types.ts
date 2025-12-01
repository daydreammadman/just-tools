/**
 * 网络信息
 */
export interface NetworkInfo {
  /** 公网 IP */
  ip: string;
  /** 地理位置 */
  location: string;
  /** ISP 运营商 */
  isp: string;
  /** HTTP Request Headers */
  headers: Record<string, string>;
}

/**
 * 设备硬件信息
 */
export interface HardwareInfo {
  /** 操作系统 */
  os: string;
  /** 操作系统版本 */
  osVersion: string;
  /** 屏幕分辨率 (逻辑像素) */
  screenResolution: string;
  /** 物理分辨率估算 */
  physicalResolution: string;
  /** 设备像素比 */
  devicePixelRatio: number;
  /** CPU 核心数 (逻辑线程) */
  cpuCores: number;
  /** 设备内存估算 (GB，粗略分级) */
  deviceMemory: number | null;
  /** GPU 信息 */
  gpu: string | null;
  /** 电池状态 */
  battery: BatteryInfo | null;
}

/**
 * 电池状态信息
 */
export interface BatteryInfo {
  /** 是否正在充电 */
  charging: boolean;
  /** 电量百分比 */
  level: number;
  /** 充电剩余时间 (秒) */
  chargingTime: number | null;
  /** 放电剩余时间 (秒) */
  dischargingTime: number | null;
}

/**
 * 浏览器环境信息
 */
export interface BrowserInfo {
  /** 浏览器名称 */
  browserName: string;
  /** 浏览器版本 */
  browserVersion: string;
  /** User Agent 原始串 */
  userAgent: string;
  /** 浏览器引擎 */
  engine: string;
  /** 引擎版本 */
  engineVersion: string;
  /** 系统语言 */
  language: string;
  /** 系统语言列表 */
  languages: string[];
  /** 是否支持 Touch */
  touchSupported: boolean;
  /** 是否支持 Cookies */
  cookiesEnabled: boolean;
  /** 是否支持 LocalStorage */
  localStorageSupported: boolean;
  /** 是否支持 SessionStorage */
  sessionStorageSupported: boolean;
  /** 是否启用 Do Not Track */
  doNotTrack: boolean;
  /** 平台 */
  platform: string;
}

/**
 * 存储项统计
 */
export interface StorageStats {
  /** 存储项数量 */
  count: number;
  /** 占用大小估算 (字节) */
  size: number;
  /** 键名列表 */
  keys: string[];
  /** 键值对（用于 Tooltip 显示） */
  items: Record<string, string>;
}

/**
 * 存储检查信息
 */
export interface StorageInfo {
  /** Cookie 统计 */
  cookies: StorageStats;
  /** LocalStorage 统计 */
  localStorage: StorageStats;
  /** SessionStorage 统计 */
  sessionStorage: StorageStats;
}

/**
 * 完整的系统信息
 */
export interface SystemInfo {
  network: NetworkInfo | null;
  hardware: HardwareInfo;
  browser: BrowserInfo;
  storage: StorageInfo;
  /** 数据采集时间戳 */
  timestamp: number;
}

/**
 * 隐私提示映射
 */
export interface PrivacyTip {
  title: string;
  description: string;
}

/**
 * 后端 API 响应
 */
export interface ApiResponse {
  ip: string;
  location: string;
  isp: string;
  headers: Record<string, string>;
}
