/**
 * 图片基本信息
 */
export interface BasicInfo {
  /** 文件名 */
  fileName: string;
  /** 文件类型 (MIME) */
  mimeType: string;
  /** 文件格式 */
  format: string;
  /** 文件大小 (bytes) */
  fileSize: number;
  /** 格式化后的文件大小 */
  fileSizeFormatted: string;
  /** 最后修改时间 */
  lastModified: string;
}

/**
 * 图片尺寸信息
 */
export interface DimensionInfo {
  /** 宽度 (px) */
  width: number;
  /** 高度 (px) */
  height: number;
  /** 宽高比 */
  aspectRatio: string;
  /** 常见比例名称 */
  aspectRatioName?: string;
  /** 总像素数 */
  totalPixels: number;
  /** 格式化的像素数 (如 1.2MP) */
  megaPixels: string;
  /** 方向 */
  orientation: 'landscape' | 'portrait' | 'square';
}

/**
 * 颜色信息
 */
export interface ColorInfo {
  /** 是否有透明度 */
  hasAlpha: boolean;
  /** 主要颜色 (最多5个) */
  dominantColors: ColorData[];
  /** 平均颜色 */
  averageColor: ColorData;
  /** 颜色空间 */
  colorSpace: string;
}

/**
 * 单个颜色数据
 */
export interface ColorData {
  /** 十六进制颜色值 */
  hex: string;
  /** RGB 值 */
  rgb: { r: number; g: number; b: number };
  /** 占比百分比 */
  percentage?: number;
}

/**
 * 技术信息
 */
export interface TechnicalInfo {
  /** Data URL 大小 */
  dataUrlSize: number;
  /** 格式化的 Data URL 大小 */
  dataUrlSizeFormatted: string;
  /** 压缩率（相对于 Data URL） */
  compressionRatio: string;
  /** 位深度估计 */
  bitDepth: string;
  /** 是否为动画 */
  isAnimated: boolean;
}

/**
 * EXIF 信息（扩展功能，需要额外库）
 */
export interface ExifInfo {
  /** 相机制造商 */
  make?: string;
  /** 相机型号 */
  model?: string;
  /** 拍摄时间 */
  dateTime?: string;
  /** GPS 位置 */
  gps?: {
    latitude: number;
    longitude: number;
  };
  /** 其他 EXIF 数据 */
  other: Record<string, unknown>;
}

/**
 * 完整的图片分析结果
 */
export interface ImageAnalysis {
  /** 基本信息 */
  basic: BasicInfo;
  /** 尺寸信息 */
  dimension: DimensionInfo;
  /** 颜色信息 */
  color: ColorInfo;
  /** 技术信息 */
  technical: TechnicalInfo;
  /** EXIF 信息 */
  exif?: ExifInfo;
  /** 预览 URL */
  previewUrl: string;
  /** 缩略图 URL (小尺寸) */
  thumbnailUrl?: string;
}

/**
 * 分析选项
 */
export interface AnalysisOptions {
  /** 是否分析颜色 */
  analyzeColors?: boolean;
  /** 是否提取 EXIF */
  extractExif?: boolean;
  /** 主要颜色数量 */
  dominantColorCount?: number;
  /** 颜色采样精度 */
  colorSampleQuality?: number;
}
