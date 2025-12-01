import type { FC } from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, RefreshCw, Image as LucideImage, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatFileSize, readFileAsDataURL, loadImage, resizeImage } from './utils';

export const ImageResizer: FC = () => {
  // 原始数据状态
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });

  // 设置状态
  const [mode, setMode] = useState<'pixel' | 'percent'>('pixel'); // pixel | percent
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [percent, setPercent] = useState<number>(100);
  const [lockRatio, setLockRatio] = useState<boolean>(true);
  const [outputFormat, setOutputFormat] = useState<string>('original');
  const [quality, setQuality] = useState<number>(80); // 0-100

  // 结果状态
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('请选择有效的图片文件');
      return;
    }

    try {
      const dataUrl = await readFileAsDataURL(file);
      const img = await loadImage(dataUrl);

      setOriginalFile(file);
      setOriginalImage(img);
      setOriginalDimensions({ width: img.width, height: img.height });

      // 重置参数
      setWidth(img.width);
      setHeight(img.height);
      setPercent(100);
      // 如果原图不是 jpg/webp/png，默认转为 png 以免出错
      const isCommon = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      setOutputFormat(isCommon ? 'original' : 'image/png');
      setProcessedUrl(null);
      
      toast.success('图片加载成功');
    } catch (error) {
      console.error(error);
      toast.error('图片加载失败');
    }
  };

  // 粘贴事件监听
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            toast.info('已从剪贴板读取图片');
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // 计算尺寸逻辑
  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockRatio && originalDimensions.width > 0) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockRatio && originalDimensions.height > 0) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(val * ratio));
    }
  };

  const handlePercentChange = (val: number) => {
    setPercent(val);
    const ratio = val / 100;
    setWidth(Math.round(originalDimensions.width * ratio));
    setHeight(Math.round(originalDimensions.height * ratio));
  };

  // 执行图片处理（防抖）
  useEffect(() => {
    if (!originalImage || !originalFile || width <= 0 || height <= 0) return;

    const timer = setTimeout(async () => {
      setIsProcessing(true);
      try {
        let targetFormat = originalFile.type;
        if (outputFormat !== 'original') {
          targetFormat = outputFormat;
        }

        const result = await resizeImage(originalImage, {
          width,
          height,
          format: targetFormat,
          quality: quality / 100,
        });

        setProcessedBlob(result.blob);
        setProcessedUrl(result.url);
      } catch (error) {
        console.error(error);
        toast.error('处理出错');
      } finally {
        setIsProcessing(false);
      }
    }, 500); // 500ms 防抖

    return () => clearTimeout(timer);
  }, [originalImage, originalFile, width, height, outputFormat, quality]);

  const handleDownload = () => {
    if (!processedUrl || !originalFile) return;
    const link = document.createElement('a');
    link.href = processedUrl;
    
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    };
    
    let finalType = outputFormat === 'original' ? originalFile.type : outputFormat;
    const ext = extMap[finalType] || 'png';
    const name = originalFile.name.replace(/\.[^/.]+$/, "");
    
    link.download = `${name}_resized.${ext}`;
    link.click();
    toast.success('下载已开始');
  };

  const reset = () => {
    setOriginalFile(null);
    setOriginalImage(null);
    setProcessedUrl(null);
  };

  // 渲染：上传界面
  if (!originalFile) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card
          className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer min-h-[400px] flex flex-col items-center justify-center p-8"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              processFile(e.dataTransfer.files[0]);
            }
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => e.target.files && processFile(e.target.files[0])}
          />
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Upload className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">点击或拖拽图片到这里</h3>
          <p className="text-muted-foreground mb-6">支持 JPG, PNG, WebP</p>
          <div className="text-sm text-muted-foreground bg-muted py-2 px-4 rounded font-mono">
            Tip: 支持 Ctrl+V 直接粘贴
          </div>
        </Card>
      </div>
    );
  }

  // 渲染：编辑界面
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 左侧设置栏 */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LucideImage className="w-5 h-5" /> 缩放设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* 模式切换 */}
              <div className="space-y-3">
                <Label>调整方式</Label>
                <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pixel">指定尺寸</TabsTrigger>
                    <TabsTrigger value="percent">百分比</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* 尺寸输入 */}
              {mode === 'pixel' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>宽度 (px)</Label>
                    <Input
                      type="number"
                      value={width}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>高度 (px)</Label>
                    <Input
                      type="number"
                      value={height}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>缩放比例</Label>
                    <span className="text-sm text-muted-foreground">{percent}%</span>
                  </div>
                  <Slider
                    value={[percent]}
                    min={1}
                    max={200}
                    step={1}
                    onValueChange={(v) => handlePercentChange(v[0])}
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    目标尺寸: {width} x {height} px
                  </div>
                </div>
              )}

              {/* 锁定比例开关 */}
              <div className="flex items-center justify-between space-x-2 py-2">
                <Label htmlFor="lock-ratio" className="flex-1">锁定纵横比</Label>
                <Switch
                  id="lock-ratio"
                  checked={lockRatio}
                  onCheckedChange={setLockRatio}
                />
              </div>

              <div className="h-px bg-border my-4" />

              {/* 格式与质量 */}
              <div className="space-y-3">
                <Label>输出格式</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择格式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">保持原格式</SelectItem>
                    <SelectItem value="image/jpeg">JPG (JPEG)</SelectItem>
                    <SelectItem value="image/png">PNG</SelectItem>
                    <SelectItem value="image/webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 质量滑块 (仅对 JPG/WebP 有效) */}
              {(outputFormat === 'image/jpeg' || outputFormat === 'image/webp' || 
               (outputFormat === 'original' && originalFile.type !== 'image/png')) && (
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between">
                    <Label>图片质量</Label>
                    <span className="text-sm text-muted-foreground">{quality}%</span>
                  </div>
                  <Slider
                    value={[quality]}
                    min={10}
                    max={100}
                    step={5}
                    onValueChange={(v) => setQuality(v[0])}
                  />
                  <p className="text-xs text-muted-foreground">
                    质量越低文件越小，但清晰度会下降。
                  </p>
                </div>
              )}

              <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={reset}>
                <Trash2 className="w-4 h-4 mr-2" /> 重新上传
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 右侧预览区域 */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div className="space-y-1">
                <CardTitle>预览与导出</CardTitle>
                {processedBlob && (
                  <CardDescription>
                    原始: {formatFileSize(originalFile.size)} → 
                    <span className="text-primary font-medium ml-1">
                      当前: {formatFileSize(processedBlob.size)}
                    </span>
                  </CardDescription>
                )}
              </div>
              <Button onClick={handleDownload} disabled={!processedUrl || isProcessing}>
                <Download className="w-4 h-4 mr-2" /> 下载图片
              </Button>
            </CardHeader>
            
            <CardContent className="flex-1 flex items-center justify-center p-6 min-h-[400px] bg-muted/30 relative overflow-hidden">
              {isProcessing ? (
                <div className="flex flex-col items-center text-muted-foreground animate-pulse">
                  <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                  <p>正在处理...</p>
                </div>
              ) : processedUrl ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* 透明背景棋盘格模拟 */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none" 
                       style={{ 
                         backgroundImage: 'linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)',
                         backgroundSize: '20px 20px',
                         backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                       }} 
                  />
                  <img
                    src={processedUrl}
                    alt="Preview"
                    className="max-w-full max-h-[600px] object-contain shadow-lg z-10"
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};