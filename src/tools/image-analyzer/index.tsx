import type { ChangeEvent } from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ImageAnalysis } from './types';
import {
  analyzeImage,
  validateImageFile,
  copyToClipboard,
  downloadAnalysis,
} from './utils';

/**
 * 信息项组件 (内部辅助组件)
 */
interface InfoItemProps {
  label: string;
  value: string;
  copyable?: boolean;
  className?: string;
}

const InfoItem = ({ label, value, copyable = false, className }: InfoItemProps) => {
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
    <div className={cn("space-y-1", className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div
        className={cn(
          'flex items-center gap-2 rounded-md bg-muted/50 p-2 text-sm min-h-[36px]',
          copyable && 'pr-1'
        )}
      >
        <span className="flex-1 break-all font-medium leading-tight">{value}</span>
        {copyable && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 shrink-0 p-0 hover:bg-background"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * 图片信息分析工具组件
 */
export const ImageAnalyzer = () => {
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // 处理文件分析 (统一处理逻辑)
  const processImageFile = useCallback(async (file: File) => {
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

  // 处理文件选择
  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageFile(file);
  }, [processImageFile]);

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

  // 复制文本 (用于颜色块等非InfoItem组件)
  const handleCopy = useCallback(async (text: string, label: string) => {
    try {
      await copyToClipboard(text);
      setCopied(label);
      toast.success(`已复制 ${text}`);
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

  // 处理拖拽进入
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  // 处理拖拽经过
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // 处理拖拽离开
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  // 处理文件放下
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processImageFile(files[0]);
    }
  }, [processImageFile]);

  // 添加全局粘贴监听
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            processImageFile(file);
            break;
          }
        }
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [processImageFile]);

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
    <div
      ref={dropZoneRef}
      className="container mx-auto max-w-6xl"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 拖拽遮罩层 */}
      {isDragging && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm pointer-events-none"
        >
          <div className="rounded-lg border-2 border-dashed border-primary bg-background/90 p-12 text-center shadow-lg">
            <Upload className="mx-auto h-16 w-16 text-primary mb-4" />
            <p className="text-xl font-semibold">释放以上传图片</p>
            <p className="mt-2 text-sm text-muted-foreground">支持所有常见图片格式</p>
          </div>
        </div>
      )}

      <div className="rounded-lg">
        {/* 头部 */}
        <div className="border-b p-4">
          <h1 className="text-xl font-semibold">图片信息分析</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            上传图片，本地分析文件属性、尺寸比例及色彩构成 (支持拖拽/粘贴/点击上传)
          </p>
        </div>

        {/* 上传控制栏 */}
        <div className="border-b p-4 bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50 sticky top-0 z-10">
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
              className="shrink-0"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isAnalyzing ? '分析中...' : '选择图片'}
            </Button>

            {analysis && (
              <>
                <div className="flex-1 min-w-0 flex items-center gap-2 text-sm">
                   <span className="text-muted-foreground hidden sm:inline-block">当前文件:</span>
                   <span className="font-medium truncate max-w-[200px] sm:max-w-md" title={analysis.basic.fileName}>
                     {analysis.basic.fileName}
                   </span>
                </div>
                <Button onClick={handleClear} variant="ghost" size="sm" className="shrink-0">
                  清除
                </Button>
              </>
            )}
          </div>
        </div>

        {analysis ? (
          <div className="p-4 space-y-6">
            
            {/* --- 核心内容区域：左右分栏布局 --- */}
            <div className="grid gap-6 md:grid-cols-12 items-start">
              
              {/* 左侧栏：预览 + 操作 (占比较小) */}
              <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-4 sticky top-24">
                <Card className="overflow-hidden border-muted-foreground/20 shadow-sm">
                  <CardHeader className="p-3 border-b bg-muted/30">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <ImageIcon className="h-4 w-4" />
                      图片预览
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 flex items-center justify-center bg-pattern">
                    <div className="relative w-full flex items-center justify-center min-h-[150px]">
                      {/* 限制图片最大高度，防止占满屏幕 */}
                      <img
                        src={analysis.previewUrl}
                        alt="预览"
                        className="max-h-[300px] w-auto max-w-full object-contain rounded shadow-sm" 
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-2">
                   <Button onClick={() => handleDownload('json')} variant="outline" size="sm" className="w-full">
                    <Download className="mr-2 h-3.5 w-3.5" />
                    JSON
                  </Button>
                  <Button onClick={() => handleDownload('txt')} variant="outline" size="sm" className="w-full">
                    <Download className="mr-2 h-3.5 w-3.5" />
                    TXT
                  </Button>
                </div>
              </div>

              {/* 右侧栏：数据信息 (占比较大) */}
              <div className="md:col-span-8 lg:col-span-9 space-y-4">
                
                {/* 第一行：基本信息 & 尺寸信息 */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* 基本信息卡片 */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Info className="h-4 w-4 text-blue-500" />
                          基本信息
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-3">
                        <InfoItem label="文件名" value={analysis.basic.fileName} copyable />
                        <div className="grid grid-cols-2 gap-3">
                             <InfoItem label="格式" value={analysis.basic.format} />
                             <InfoItem label="大小" value={analysis.basic.fileSizeFormatted} />
                        </div>
                        <InfoItem label="MIME 类型" value={analysis.basic.mimeType} copyable />
                        <InfoItem label="最后修改" value={analysis.basic.lastModified} />
                      </CardContent>
                    </Card>

                    {/* 尺寸信息卡片 */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Ruler className="h-4 w-4 text-orange-500" />
                          尺寸信息
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-3">
                        <div className="grid grid-cols-2 gap-3">
                           <InfoItem label="宽度" value={`${analysis.dimension.width} px`} />
                           <InfoItem label="高度" value={`${analysis.dimension.height} px`} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <InfoItem label="比例" value={`${analysis.dimension.aspectRatio} (${analysis.dimension.aspectRatioName || '-'})`} />
                           <InfoItem label="方向" value={getOrientationName(analysis.dimension.orientation)} />
                        </div>
                        <InfoItem label="总像素" value={`${analysis.dimension.totalPixels.toLocaleString()} (${analysis.dimension.megaPixels})`} />
                      </CardContent>
                    </Card>
                </div>

                {/* 第二行：颜色分析 & 技术参数 */}
                <div className="grid gap-4 lg:grid-cols-2">
                    
                    {/* 颜色分析卡片 (优化版) */}
                    <Card className="flex flex-col">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                            <Palette className="h-4 w-4 text-purple-500" />
                            色彩分析
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 flex-1">
                            {/* 平均色 */}
                            <div className="flex items-center gap-4">
                                <div 
                                    className="h-12 w-12 rounded-full border shadow-sm shrink-0 ring-2 ring-offset-1 ring-muted"
                                    style={{ backgroundColor: analysis.color.averageColor.hex }}
                                />
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-medium text-muted-foreground">平均色值</Label>
                                        <span className="text-xs font-mono text-muted-foreground">
                                            RGB: {analysis.color.averageColor.rgb.r}, {analysis.color.averageColor.rgb.g}, {analysis.color.averageColor.rgb.b}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 rounded bg-muted px-2 py-1 font-mono text-sm font-bold">
                                            {analysis.color.averageColor.hex}
                                        </code>
                                        <Button 
                                            variant="outline" size="icon" className="h-7 w-7"
                                            onClick={() => handleCopy(analysis.color.averageColor.hex, 'avg')}
                                        >
                                            {copied === 'avg' ? <Check className="h-3.5 w-3.5"/> : <Copy className="h-3.5 w-3.5"/>}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* 主色调色带 (Space efficient) */}
                            {analysis.color.dominantColors.length > 0 && (
                                 <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>主色调构成</span>
                                        <span>Top 5</span>
                                    </div>
                                    {/* 色带容器 */}
                                    <div className="flex h-10 w-full overflow-hidden rounded-md border shadow-sm">
                                        {analysis.color.dominantColors.map((color, i) => (
                                            <div 
                                                key={i} 
                                                style={{ width: `${color.percentage}%`, backgroundColor: color.hex }}
                                                className="h-full hover:opacity-80 cursor-pointer transition-all relative group flex items-center justify-center"
                                                onClick={() => handleCopy(color.hex, `dom-${i}`)}
                                            >
                                                {/* Hover Tooltip (简单实现) */}
                                                <span className="sr-only">{color.hex}</span>
                                                {/* 如果比例够大，显示文字，否则隐藏 */}
                                                {color.percentage && color.percentage > 10 && (
                                                    <span className="text-[10px] font-medium text-white/90 drop-shadow-sm hidden sm:inline-block mix-blend-difference">
                                                        {Math.round(color.percentage)}%
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* 颜色代码列表 - 仅显示 RGB 和 Hex */}
                                    <div className="grid grid-cols-5 gap-1 mt-2">
                                        {analysis.color.dominantColors.map((color, i) => (
                                            <div key={i} className="text-center">
                                                <div 
                                                    className="text-[10px] font-mono text-muted-foreground cursor-pointer hover:text-foreground truncate"
                                                    onClick={() => handleCopy(color.hex, `dom-txt-${i}`)}
                                                >
                                                    {color.hex}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                 </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 技术参数卡片 */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                            <FileText className="h-4 w-4 text-green-500" />
                            技术参数
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            <InfoItem label="位深度" value={analysis.technical.bitDepth.toString()} />
                            <InfoItem label="压缩率" value={analysis.technical.compressionRatio} />
                            <InfoItem label="透明通道" value={analysis.color.hasAlpha ? '包含' : '无'} />
                            <InfoItem label="动画帧" value={analysis.technical.isAnimated ? '是' : '否'} />
                            <InfoItem label="色彩空间" value={analysis.color.colorSpace} className="col-span-2" />
                            <InfoItem label="Data URL 大小" value={analysis.technical.dataUrlSizeFormatted} className="col-span-2" />
                        </CardContent>
                    </Card>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center py-20 text-center min-h-[400px]">
            <div className="rounded-full bg-muted/50 p-6 mb-6 transition-transform hover:scale-105 cursor-pointer ring-1 ring-border" onClick={handleUploadClick}>
              <Upload className="h-12 w-12 text-muted-foreground/70" />
            </div>
            <h3 className="text-lg font-semibold mb-2">拖拽、粘贴或点击上传图片</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md leading-relaxed">
              支持 PNG, JPEG, WebP, GIF, BMP, ICO, SVG 等格式。<br/>
              拖拽文件到页面、使用 Ctrl+V 粘贴，或点击按钮选择。<br/>
              所有分析均在浏览器本地完成，数据不会上传至服务器。
            </p>
            <Button onClick={handleUploadClick} size="lg" className="shadow-sm">
              <Upload className="mr-2 h-4 w-4" />
              选择图片
            </Button>
          </div>
        )}

        {/* 底部提示 */}
        {!analysis && (
            <div className="border-t p-4 bg-muted/5">
            <p className="text-xs text-center text-muted-foreground">
                Power by Browser Native API & Canvas Analysis
            </p>
            </div>
        )}
      </div>
    </div>
  );
};