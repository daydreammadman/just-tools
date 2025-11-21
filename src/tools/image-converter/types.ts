/**
 * 支持的图片格式
 */
export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'gif' | 'bmp' | 'ico';

/**
 * 图片质量（仅用于 JPEG 和 WebP）
 */
export type ImageQuality = number; // 0.1 - 1.0

/**
 * 转换选项
 */
export interface ConversionOptions {
  /** 目标格式 */
  format: ImageFormat;
  /** 图片质量 (0.1-1.0) */
  quality?: ImageQuality;
  /** 是否保持透明度 */
  preserveTransparency?: boolean;
}

/**
 * 转换结果
 */
export interface ConversionResult {
  /** 是否成功 */
  success: boolean;
  /** 转换后的数据 URL */
  dataUrl?: string;
  /** 错误信息 */
  error?: string;
  /** 原始大小 (bytes) */
  originalSize?: number;
  /** 转换后大小 (bytes) */
  convertedSize?: number;
  /** 压缩率 */
  compressionRatio?: string;
}

/**
 * 图片信息
 */
export interface ImageInfo {
  /** 文件名 */
  fileName: string;
  /** 原始格式 */
  originalFormat: string;
  /** 文件大小 (bytes) */
  fileSize: number;
  /** 图片宽度 */
  width: number;
  /** 图片高度 */
  height: number;
  /** 预览 URL */
  previewUrl: string;
}
