import type { FC, ChangeEvent } from 'react';
import { useState, useCallback, useRef } from 'react';
import { Upload, Download, X, Image as ImageIcon, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ImageFormat, ImageInfo, ConversionResult } from './types';
import {
  readImageFile,
  convertImage,
  downloadImage,
  validateImageFile,
  formatFileSize,
} from './utils';

/**
 * 图片格式转换工具组件
 */
export const ImageConverter: FC = () => {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('png');
  const [quality, setQuality] = useState<number>(92);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 格式选项
  const formats: { value: ImageFormat; label: string; description: string }[] = [
    { value: 'png', label: 'PNG', description: '无损压缩，支持透明' },
    { value: 'jpeg', label: 'JPEG', description: '有损压缩，体积小' },
    { value: 'webp', label: 'WebP', description: '现代格式，高压缩' },
    { value: 'gif', label: 'GIF', description: '支持动画' },
    { value: 'bmp', label: 'BMP', description: '位图格式' },
    { value: 'ico', label: 'ICO', description: '图标格式' },
  ];

  // 处理文件选择
  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || '文件无效');
      return;
    }

    try {
      const info = await readImageFile(file);
      setImageInfo(info);
      setResult(null); // 清除之前的结果
      toast.success('图片加载成功');
    } catch (error) {
      console.error('File read error:', error);
      toast.error(error instanceof Error ? error.message : '加载图片失败');
    }
  }, []);

  // 处理转换
  const handleConvert = useCallback(async () => {
    if (!imageInfo) {
      toast.error('请先上传图片');
      return;
    }

    setIsConverting(true);

    try {
      const conversionResult = await convertImage(imageInfo, {
        format: targetFormat,
        quality: quality / 100,
        preserveTransparency: targetFormat === 'png' || targetFormat === 'webp',
      });

      if (conversionResult.success) {
        setResult(conversionResult);
        toast.success(`成功转换为 ${targetFormat.toUpperCase()} 格式`);
      } else {
        toast.error(conversionResult.error || '转换失败');
      }
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('转换失败，请重试');
    } finally {
      setIsConverting(false);
    }
  }, [imageInfo, targetFormat, quality]);

  // 下载结果
  const handleDownload = useCallback(() => {
    if (!result?.dataUrl || !imageInfo) return;

    try {
      downloadImage(result.dataUrl, imageInfo.fileName, targetFormat);
      toast.success('下载成功');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('下载失败');
    }
  }, [result, imageInfo, targetFormat]);

  // 清除
  const handleClear = useCallback(() => {
    setImageInfo(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // 触发文件选择
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="container mx-auto">
      <div className="rounded-lg">
        {/* 头部 */}
        <div className="border-b p-4">
          <h1 className="text-xl font-semibold">图片格式转换</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            支持 PNG、JPEG、WebP、GIF、BMP、ICO 等格式互转
          </p>
        </div>

        {/* 上传区域 */}
        <div className="border-b p-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button onClick={handleUploadClick} variant="outline" className="flex-shrink-0">
              <Upload className="mr-2 h-4 w-4" />
              选择图片
            </Button>

            {imageInfo && (
              <>
                <div className="flex-1 truncate text-sm">
                  <span className="font-medium">{imageInfo.fileName}</span>
                  <span className="ml-2 text-muted-foreground">
                    ({imageInfo.width} × {imageInfo.height}, {formatFileSize(imageInfo.fileSize)})
                  </span>
                </div>
                <Button onClick={handleClear} variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {imageInfo ? (
          <>
            {/* 配置区域 */}
            <div className="border-b p-4 space-y-4">
              {/* 格式选择 */}
              <div className="space-y-2">
                <Label>目标格式</Label>
                <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
                  {formats.map((format) => (
                    <button
                      key={format.value}
                      onClick={() => setTargetFormat(format.value)}
                      className={cn(
                        'rounded-lg border-2 p-3 text-center transition-all',
                        'hover:border-primary/50',
                        targetFormat === format.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      )}
                      title={format.description}
                    >
                      <div className="font-semibold text-sm">{format.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 质量调节（仅 JPEG 和 WebP） */}
              {(targetFormat === 'jpeg' || targetFormat === 'webp') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="quality">图片质量</Label>
                    <span className="text-sm font-medium">{quality}%</span>
                  </div>
                  <input
                    id="quality"
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    较低的质量可以减小文件大小，但会降低图片清晰度
                  </p>
                </div>
              )}

              {/* 转换按钮 */}
              <Button
                onClick={handleConvert}
                disabled={isConverting}
                className="w-full"
              >
                {isConverting ? '转换中...' : '开始转换'}
              </Button>
            </div>

            {/* 预览和结果区域 */}
            <div className="p-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* 原图预览 */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    原图预览
                  </Label>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted/50">
                    <img
                      src={imageInfo.previewUrl}
                      alt="原图"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-xs">
                    <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="space-y-1">
                      <div>
                        <span className="text-muted-foreground">格式: </span>
                        <span className="font-medium">{imageInfo.originalFormat.toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">尺寸: </span>
                        <span className="font-medium">
                          {imageInfo.width} × {imageInfo.height}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">大小: </span>
                        <span className="font-medium">{formatFileSize(imageInfo.fileSize)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 转换结果 */}
                {result?.success && result.dataUrl ? (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      转换结果
                    </Label>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted/50">
                      <img
                        src={result.dataUrl}
                        alt="转换结果"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex items-start gap-2 rounded-md bg-primary/10 p-3 text-xs">
                      <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                      <div className="space-y-1">
                        <div>
                          <span className="text-muted-foreground">格式: </span>
                          <span className="font-medium">{targetFormat.toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">大小: </span>
                          <span className="font-medium">
                            {formatFileSize(result.convertedSize || 0)}
                          </span>
                        </div>
                        {result.compressionRatio && (
                          <div>
                            <span className="text-muted-foreground">压缩率: </span>
                            <span className="font-medium text-green-600">
                              {result.compressionRatio}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button onClick={handleDownload} className="w-full" variant="default">
                      <Download className="mr-2 h-4 w-4" />
                      下载图片
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center aspect-video rounded-lg border-2 border-dashed bg-muted/20">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
                      <p className="text-sm">选择格式后点击"开始转换"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Upload className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">上传图片开始转换</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              支持 PNG、JPEG、WebP、GIF、BMP、ICO 等常见图片格式
              <br />
              文件大小限制: 10MB
            </p>
            <Button onClick={handleUploadClick}>
              <Upload className="mr-2 h-4 w-4" />
              选择图片
            </Button>
          </div>
        )}

        {/* 底部提示 */}
        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground">
            提示: 所有转换操作均在浏览器本地完成，不会上传到服务器，确保您的隐私安全。
          </p>
        </div>
      </div>
    </div>
  );
};
