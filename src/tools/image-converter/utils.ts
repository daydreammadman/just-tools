import type {
  ImageFormat,
  ConversionOptions,
  ConversionResult,
  ImageInfo,
} from './types';

/**
 * 获取文件的 MIME 类型
 */
function getMimeType(format: ImageFormat): string {
  const mimeTypes: Record<ImageFormat, string> = {
    png: 'image/png',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
  };
  return mimeTypes[format];
}

/**
 * 从文件名或 MIME 类型获取格式
 */
function getImageFormat(fileName: string, mimeType: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext && ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'ico'].includes(ext)) {
    return ext === 'jpg' ? 'jpeg' : ext;
  }

  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('jpeg')) return 'jpeg';
  if (mimeType.includes('webp')) return 'webp';
  if (mimeType.includes('gif')) return 'gif';
  if (mimeType.includes('bmp')) return 'bmp';
  if (mimeType.includes('icon')) return 'ico';

  return 'unknown';
}

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
 * 计算压缩率
 */
function calculateCompressionRatio(originalSize: number, convertedSize: number): string {
  const ratio = ((originalSize - convertedSize) / originalSize) * 100;
  return ratio > 0 ? `${ratio.toFixed(1)}%` : '0%';
}

/**
 * 从 Data URL 获取文件大小
 */
function getDataUrlSize(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1];
  const padding = (base64.match(/=/g) || []).length;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/**
 * 读取图片文件并获取信息
 */
export async function readImageFile(file: File): Promise<ImageInfo> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const img = new Image();

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;

      img.onload = () => {
        resolve({
          fileName: file.name,
          originalFormat: getImageFormat(file.name, file.type),
          fileSize: file.size,
          width: img.width,
          height: img.height,
          previewUrl: dataUrl,
        });
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
 * 转换图片格式
 */
export async function convertImage(
  imageInfo: ImageInfo,
  options: ConversionOptions
): Promise<ConversionResult> {
  try {
    const { format, quality = 0.92, preserveTransparency = true } = options;

    // 创建 Image 对象
    const img = new Image();
    img.src = imageInfo.previewUrl;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('图片加载失败'));
    });

    // 创建 Canvas
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('无法创建 Canvas 上下文');
    }

    // 处理透明度
    if (!preserveTransparency && (format === 'jpeg' || format === 'bmp')) {
      // JPEG 和 BMP 不支持透明度，填充白色背景
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 绘制图片
    ctx.drawImage(img, 0, 0);

    // 转换格式
    const mimeType = getMimeType(format);
    const dataUrl = canvas.toBlob
      ? await new Promise<string>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error('转换失败'));
                reader.readAsDataURL(blob);
              } else {
                reject(new Error('生成 Blob 失败'));
              }
            },
            mimeType,
            quality
          );
        })
      : canvas.toDataURL(mimeType, quality);

    const convertedSize = getDataUrlSize(dataUrl);
    const compressionRatio = calculateCompressionRatio(imageInfo.fileSize, convertedSize);

    return {
      success: true,
      dataUrl,
      originalSize: imageInfo.fileSize,
      convertedSize,
      compressionRatio,
    };
  } catch (error) {
    console.error('Conversion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '转换失败',
    };
  }
}

/**
 * 下载转换后的图片
 */
export function downloadImage(dataUrl: string, fileName: string, format: ImageFormat): void {
  const link = document.createElement('a');
  const baseName = fileName.replace(/\.[^/.]+$/, ''); // 去除原扩展名
  link.download = `${baseName}.${format}`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 验证图片文件
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // 检查文件类型
  const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp', 'image/x-icon'];
  if (!validTypes.some(type => file.type.includes(type.split('/')[1]))) {
    return { valid: false, error: '不支持的图片格式' };
  }

  // 检查文件大小 (限制 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: '文件大小不能超过 10MB' };
  }

  return { valid: true };
}
