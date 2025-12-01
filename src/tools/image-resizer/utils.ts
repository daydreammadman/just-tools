/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
  
  /**
   * 读取文件为 DataURL
   */
  export function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * 加载图片对象
   */
  export function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
  
  interface ResizeOptions {
    width: number;
    height: number;
    format: string;
    quality: number;
  }
  
  interface ResizeResult {
    blob: Blob;
    url: string;
  }
  
  /**
   * 使用 Canvas 调整图片尺寸
   */
  export function resizeImage(
    img: HTMLImageElement,
    options: ResizeOptions
  ): Promise<ResizeResult> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = options.width;
      canvas.height = options.height;
      const ctx = canvas.getContext('2d');
  
      if (!ctx) {
        reject(new Error('无法获取 Canvas 上下文'));
        return;
      }
  
      // 提高绘图质量
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
  
      // 绘制图片
      ctx.drawImage(img, 0, 0, options.width, options.height);
  
      // 转换为 Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({
              blob,
              url: URL.createObjectURL(blob),
            });
          } else {
            reject(new Error('图片转换失败'));
          }
        },
        options.format,
        options.quality
      );
    });
  }