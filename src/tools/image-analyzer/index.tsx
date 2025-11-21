import type { FC, ChangeEvent } from 'react';
import { useState, useCallback, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Info,
  Palette,
  Ruler,
  FileText,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ImageAnalysis } from './types';
import {
  analyzeImage,
  validateImageFile,
  formatFileSize,
  copyToClipboard,
  downloadAnalysis,
} from './utils';

/**
 * 图片信息分析工具组件
 */
export const ImageAnalyzer: FC = () => {
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    setIsAnalyzing(true);

    try {
      const result = await analyzeImage(file, {
        analyzeColors: true,
        dominantColorCount: 5,
        colorSampleQuality: 10,
      });
      setAnalysis(result);
      toast.success('分析完成');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : '分析失败');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // 触发文件选择
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 清除
  const handleClear = useCallback(() => {
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // 复制文本
  const handleCopy = useCallback(async (text: string, label: string) => {
    try {
      await copyToClipboard(text);
      setCopied(label);
      toast.success('已复制到剪贴板');
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error('复制失败');
    }
  }, []);

  // 下载分析结果
  const handleDownload = useCallback((format: 'json' | 'txt') => {
    if (!analysis) return;
    try {
      downloadAnalysis(analysis, format);
      toast.success('下载成功');
    } catch (error) {
      toast.error('下载失败');
    }
  }, [analysis]);

  // 获取方向名称
  const getOrientationName = (orientation: string): string => {
    const names: Record<string, string> = {
      landscape: '横向',
      portrait: '纵向',
      square: '正方形',
    };
    return names[orientation] || orientation;
  };

  return (
    <div className="container mx-auto">
      <div className="rounded-lg">
        {/* 头部 */}
        <div className="border-b p-4">
          <h1 className="text-xl font-semibold">图片信息分析</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            上传图片，分析并显示详细的文件信息、尺寸、颜色等属性
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
            <Button
              onClick={handleUploadClick}
              disabled={isAnalyzing}
              variant={analysis ? 'outline' : 'default'}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isAnalyzing ? '分析中...' : '选择图片'}
            </Button>

            {analysis && (
              <>
                <div className="flex-1 truncate text-sm">
                  <span className="font-medium">{analysis.basic.fileName}</span>
                </div>
                <Button onClick={handleClear} variant="ghost" size="sm">
                  清除
                </Button>
              </>
            )}
          </div>
        </div>

        {analysis ? (
          <div className="p-4 space-y-4">
            {/* 图片预览 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon className="h-4 w-4" />
                  图片预览
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted/50">
                  <img
                    src={analysis.previewUrl}
                    alt="预览"
                    className="h-full w-full object-contain"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="h-4 w-4" />
                  基本信息
                </CardTitle>
                <CardDescription>文件的基本属性</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <InfoItem label="文件名" value={analysis.basic.fileName} copyable />
                  <InfoItem label="格式" value={analysis.basic.format} />
                  <InfoItem label="MIME 类型" value={analysis.basic.mimeType} copyable />
                  <InfoItem label="文件大小" value={analysis.basic.fileSizeFormatted} />
                  <InfoItem
                    label="原始大小"
                    value={`${formatFileSize(analysis.basic.fileSize)} (${analysis.basic.fileSize.toLocaleString()} bytes)`}
                  />
                  <InfoItem label="最后修改" value={analysis.basic.lastModified} />
                </div>
              </CardContent>
            </Card>

            {/* 尺寸信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Ruler className="h-4 w-4" />
                  尺寸信息
                </CardTitle>
                <CardDescription>图片的尺寸和比例</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <InfoItem label="宽度" value={`${analysis.dimension.width}px`} />
                  <InfoItem label="高度" value={`${analysis.dimension.height}px`} />
                  <InfoItem
                    label="宽高比"
                    value={
                      analysis.dimension.aspectRatioName
                        ? `${analysis.dimension.aspectRatio} (${analysis.dimension.aspectRatioName})`
                        : analysis.dimension.aspectRatio
                    }
                  />
                  <InfoItem
                    label="方向"
                    value={getOrientationName(analysis.dimension.orientation)}
                  />
                  <InfoItem
                    label="总像素"
                    value={`${analysis.dimension.totalPixels.toLocaleString()} (${analysis.dimension.megaPixels})`}
                  />
                  <InfoItem
                    label="尺寸"
                    value={`${analysis.dimension.width} × ${analysis.dimension.height}`}
                    copyable
                  />
                </div>
              </CardContent>
            </Card>

            {/* 颜色信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Palette className="h-4 w-4" />
                  颜色信息
                </CardTitle>
                <CardDescription>图片的主要颜色和色彩分析</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 透明度和平均颜色 */}
                <div className="grid gap-3 md:grid-cols-2">
                  <InfoItem
                    label="透明度"
                    value={analysis.color.hasAlpha ? '有透明通道' : '无透明通道'}
                  />
                  <InfoItem label="颜色空间" value={analysis.color.colorSpace} />
                </div>

                {/* 平均颜色 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">平均颜色</Label>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 shrink-0 rounded-md border shadow-sm"
                      style={{ backgroundColor: analysis.color.averageColor.hex }}
                    />
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">
                          {analysis.color.averageColor.hex}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() =>
                            handleCopy(analysis.color.averageColor.hex, 'avg-color')
                          }
                        >
                          {copied === 'avg-color' ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <div className="text-muted-foreground">
                        RGB: {analysis.color.averageColor.rgb.r},{' '}
                        {analysis.color.averageColor.rgb.g},{' '}
                        {analysis.color.averageColor.rgb.b}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 主要颜色 */}
                {analysis.color.dominantColors.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">主要颜色</Label>
                    <div className="space-y-2">
                      {analysis.color.dominantColors.map((color, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 shrink-0 rounded-md border shadow-sm"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="flex-1 space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium">{color.hex}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                                onClick={() => handleCopy(color.hex, `color-${index}`)}
                              >
                                {copied === `color-${index}` ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                            <div className="text-muted-foreground">
                              RGB: {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                              {color.percentage && ` • ${color.percentage}%`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 技术信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  技术信息
                </CardTitle>
                <CardDescription>图片的技术参数</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <InfoItem label="位深度" value={analysis.technical.bitDepth} />
                  <InfoItem
                    label="Data URL 大小"
                    value={analysis.technical.dataUrlSizeFormatted}
                  />
                  <InfoItem label="压缩率" value={analysis.technical.compressionRatio} />
                  <InfoItem
                    label="是否动画"
                    value={analysis.technical.isAnimated ? '是' : '否'}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleDownload('json')} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                导出 JSON
              </Button>
              <Button onClick={() => handleDownload('txt')} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                导出 TXT
              </Button>
            </div>
          </div>
        ) : (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Upload className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">上传图片开始分析</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              支持所有常见图片格式 (PNG、JPEG、WebP、GIF、BMP 等)
              <br />
              文件大小限制: 50MB
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
            提示: 所有分析操作均在浏览器本地完成，不会上传到服务器。支持导出分析报告为
            JSON 或 TXT 格式。
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * 信息项组件
 */
interface InfoItemProps {
  label: string;
  value: string;
  copyable?: boolean;
}

const InfoItem: FC<InfoItemProps> = ({ label, value, copyable = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (): Promise<void> => {
    try {
      await copyToClipboard(value);
      setCopied(true);
      toast.success('已复制');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('复制失败');
    }
  };

  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div
        className={cn(
          'flex items-center gap-2 rounded-md bg-muted/50 p-2 text-sm',
          copyable && 'pr-1'
        )}
      >
        <span className="flex-1 break-all font-medium">{value}</span>
        {copyable && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 shrink-0 p-0"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        )}
      </div>
    </div>
  );
};
