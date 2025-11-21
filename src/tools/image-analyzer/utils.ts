import type {
  BasicInfo,
  DimensionInfo,
  ColorInfo,
  ColorData,
  TechnicalInfo,
  ImageAnalysis,
  AnalysisOptions,
} from './types';

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 格式化日期时间
 */
function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * 获取图片格式
 */
function getImageFormat(mimeType: string, fileName: string): string {
  if (mimeType.includes('png')) return 'PNG';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPEG';
  if (mimeType.includes('webp')) return 'WebP';
  if (mimeType.includes('gif')) return 'GIF';
  if (mimeType.includes('bmp')) return 'BMP';
  if (mimeType.includes('svg')) return 'SVG';
  if (mimeType.includes('icon')) return 'ICO';
  if (mimeType.includes('tiff')) return 'TIFF';

  // 从文件名推断
  const ext = fileName.split('.').pop()?.toUpperCase();
  return ext || 'Unknown';
}

/**
 * 计算宽高比
 */
function calculateAspectRatio(width: number, height: number): { ratio: string; name?: string } {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  const w = width / divisor;
  const h = height / divisor;

  // 常见比例
  const commonRatios: Record<string, string> = {
    '16:9': '16:9 (宽屏)',
    '4:3': '4:3 (标准)',
    '3:2': '3:2 (相机)',
    '1:1': '1:1 (正方形)',
    '21:9': '21:9 (超宽屏)',
    '9:16': '9:16 (竖屏)',
    '3:4': '3:4 (竖屏标准)',
    '2:3': '2:3 (竖屏相机)',
  };

  const ratioStr = `${w}:${h}`;
  return {
    ratio: ratioStr,
    name: commonRatios[ratioStr],
  };
}

/**
 * 获取方向
 */
function getOrientation(width: number, height: number): 'landscape' | 'portrait' | 'square' {
  if (width > height) return 'landscape';
  if (width < height) return 'portrait';
  return 'square';
}

/**
 * 格式化百万像素
 */
function formatMegaPixels(pixels: number): string {
  const mp = pixels / 1000000;
  if (mp < 0.1) return `${(pixels / 1000).toFixed(0)}K`;
  return `${mp.toFixed(1)}MP`;
}

/**
 * RGB 转十六进制
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

/**
 * 从 Data URL 获取大小
 */
function getDataUrlSize(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1];
  if (!base64) return 0;
  const padding = (base64.match(/=/g) || []).length;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/**
 * 分析基本信息
 */
function analyzeBasicInfo(file: File): BasicInfo {
  return {
    fileName: file.name,
    mimeType: file.type || 'unknown',
    format: getImageFormat(file.type, file.name),
    fileSize: file.size,
    fileSizeFormatted: formatFileSize(file.size),
    lastModified: formatDateTime(file.lastModified),
  };
}

/**
 * 分析尺寸信息
 */
function analyzeDimensionInfo(width: number, height: number): DimensionInfo {
  const totalPixels = width * height;
  const aspectRatio = calculateAspectRatio(width, height);

  return {
    width,
    height,
    aspectRatio: aspectRatio.ratio,
    aspectRatioName: aspectRatio.name,
    totalPixels,
    megaPixels: formatMegaPixels(totalPixels),
    orientation: getOrientation(width, height),
  };
}

/**
 * 分析颜色信息
 */
async function analyzeColorInfo(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  options: AnalysisOptions
): Promise<ColorInfo> {
  const { dominantColorCount = 5, colorSampleQuality = 10 } = options;

  // 获取图像数据
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 检查是否有透明度
  let hasAlpha = false;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) {
      hasAlpha = true;
      break;
    }
  }

  // 颜色统计 (降低采样以提高性能)
  const colorMap = new Map<string, { count: number; rgb: { r: number; g: number; b: number } }>();
  const step = 4 * colorSampleQuality;

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let pixelCount = 0;

  for (let i = 0; i < data.length; i += step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // 跳过透明像素
    if (a < 128) continue;

    // 量化颜色以减少唯一颜色数量
    const qR = Math.round(r / 32) * 32;
    const qG = Math.round(g / 32) * 32;
    const qB = Math.round(b / 32) * 32;
    const key = `${qR},${qG},${qB}`;

    const existing = colorMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorMap.set(key, { count: 1, rgb: { r: qR, g: qG, b: qB } });
    }

    totalR += r;
    totalG += g;
    totalB += b;
    pixelCount++;
  }

  // 获取主要颜色
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, dominantColorCount);

  const totalCount = sortedColors.reduce((sum, [, data]) => sum + data.count, 0);

  const dominantColors: ColorData[] = sortedColors.map(([, data]) => ({
    hex: rgbToHex(data.rgb.r, data.rgb.g, data.rgb.b),
    rgb: data.rgb,
    percentage: parseFloat(((data.count / totalCount) * 100).toFixed(1)),
  }));

  // 平均颜色
  const avgR = Math.round(totalR / pixelCount);
  const avgG = Math.round(totalG / pixelCount);
  const avgB = Math.round(totalB / pixelCount);

  const averageColor: ColorData = {
    hex: rgbToHex(avgR, avgG, avgB),
    rgb: { r: avgR, g: avgG, b: avgB },
  };

  return {
    hasAlpha,
    dominantColors,
    averageColor,
    colorSpace: 'RGB',
  };
}

/**
 * 分析技术信息
 */
function analyzeTechnicalInfo(
  fileSize: number,
  dataUrl: string,
  format: string
): TechnicalInfo {
  const dataUrlSize = getDataUrlSize(dataUrl);
  const compressionRatio = fileSize > 0
    ? `${(((dataUrlSize - fileSize) / dataUrlSize) * 100).toFixed(1)}%`
    : 'N/A';

  // 估计位深度
  let bitDepth = '24-bit';
  if (format === 'PNG') {
    bitDepth = '24-bit or 32-bit (with alpha)';
  } else if (format === 'JPEG') {
    bitDepth = '24-bit';
  } else if (format === 'GIF') {
    bitDepth = '8-bit (256 colors)';
  }

  return {
    dataUrlSize,
    dataUrlSizeFormatted: formatFileSize(dataUrlSize),
    compressionRatio,
    bitDepth,
    isAnimated: format === 'GIF', // 简化判断
  };
}

/**
 * 主分析函数
 */
export async function analyzeImage(
  file: File,
  options: AnalysisOptions = {}
): Promise<ImageAnalysis> {
  const { analyzeColors = true } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;

      const img = new Image();

      img.onload = async () => {
        try {
          // 创建 Canvas
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('无法创建 Canvas 上下文');
          }

          ctx.drawImage(img, 0, 0);

          // 分析各项信息
          const basic = analyzeBasicInfo(file);
          const dimension = analyzeDimensionInfo(img.width, img.height);
          const technical = analyzeTechnicalInfo(file.size, dataUrl, basic.format);

          let color: ColorInfo;
          if (analyzeColors) {
            color = await analyzeColorInfo(canvas, ctx, options);
          } else {
            // 提供默认值
            color = {
              hasAlpha: false,
              dominantColors: [],
              averageColor: { hex: '#000000', rgb: { r: 0, g: 0, b: 0 } },
              colorSpace: 'RGB',
            };
          }

          // 生成缩略图（最大 200px）
          const maxThumbSize = 200;
          let thumbCanvas: HTMLCanvasElement | undefined;
          if (img.width > maxThumbSize || img.height > maxThumbSize) {
            const scale = Math.min(maxThumbSize / img.width, maxThumbSize / img.height);
            thumbCanvas = document.createElement('canvas');
            thumbCanvas.width = img.width * scale;
            thumbCanvas.height = img.height * scale;
            const thumbCtx = thumbCanvas.getContext('2d');
            if (thumbCtx) {
              thumbCtx.drawImage(img, 0, 0, thumbCanvas.width, thumbCanvas.height);
            }
          }

          resolve({
            basic,
            dimension,
            color,
            technical,
            previewUrl: dataUrl,
            thumbnailUrl: thumbCanvas?.toDataURL() || dataUrl,
          });
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('无法加载图片'));
      };

      img.src = dataUrl;
    };

    reader.onerror = () => {
      reject(new Error('无法读取文件'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 验证图片文件
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // 检查文件类型
  const validTypes = ['image/'];
  if (!validTypes.some(type => file.type.startsWith(type))) {
    return { valid: false, error: '不支持的文件格式，请上传图片文件' };
  }

  // 检查文件大小 (限制 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: '文件大小不能超过 50MB' };
  }

  return { valid: true };
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

/**
 * 导出分析结果为 JSON
 */
export function exportAsJSON(analysis: ImageAnalysis): string {
  return JSON.stringify(analysis, null, 2);
}

/**
 * 下载分析结果
 */
export function downloadAnalysis(analysis: ImageAnalysis, format: 'json' | 'txt'): void {
  let content: string;
  let filename: string;
  let mimeType: string;

  if (format === 'json') {
    content = exportAsJSON(analysis);
    filename = `${analysis.basic.fileName}_analysis.json`;
    mimeType = 'application/json';
  } else {
    content = formatAnalysisAsText(analysis);
    filename = `${analysis.basic.fileName}_analysis.txt`;
    mimeType = 'text/plain';
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 格式化分析结果为文本
 */
function formatAnalysisAsText(analysis: ImageAnalysis): string {
  const lines: string[] = [
    '=== 图片分析报告 ===',
    '',
    '【基本信息】',
    `文件名: ${analysis.basic.fileName}`,
    `格式: ${analysis.basic.format}`,
    `MIME 类型: ${analysis.basic.mimeType}`,
    `文件大小: ${analysis.basic.fileSizeFormatted}`,
    `最后修改: ${analysis.basic.lastModified}`,
    '',
    '【尺寸信息】',
    `宽度: ${analysis.dimension.width}px`,
    `高度: ${analysis.dimension.height}px`,
    `宽高比: ${analysis.dimension.aspectRatio}${analysis.dimension.aspectRatioName ? ` (${analysis.dimension.aspectRatioName})` : ''}`,
    `总像素: ${analysis.dimension.totalPixels.toLocaleString()} (${analysis.dimension.megaPixels})`,
    `方向: ${analysis.dimension.orientation === 'landscape' ? '横向' : analysis.dimension.orientation === 'portrait' ? '纵向' : '正方形'}`,
    '',
    '【颜色信息】',
    `透明度: ${analysis.color.hasAlpha ? '有' : '无'}`,
    `平均颜色: ${analysis.color.averageColor.hex} (RGB: ${analysis.color.averageColor.rgb.r}, ${analysis.color.averageColor.rgb.g}, ${analysis.color.averageColor.rgb.b})`,
    `主要颜色:`,
  ];

  analysis.color.dominantColors.forEach((color, i) => {
    lines.push(`  ${i + 1}. ${color.hex} - ${color.percentage}%`);
  });

  lines.push(
    '',
    '【技术信息】',
    `位深度: ${analysis.technical.bitDepth}`,
    `Data URL 大小: ${analysis.technical.dataUrlSizeFormatted}`,
    `压缩率: ${analysis.technical.compressionRatio}`,
    `动画: ${analysis.technical.isAnimated ? '是' : '否'}`,
  );

  return lines.join('\n');
}
