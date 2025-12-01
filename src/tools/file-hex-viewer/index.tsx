/**
 * File X-Ray (文件字节透视镜) - 主组件
 */

import type { FC } from 'react';
import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { Upload, X, ChevronDown, Info } from 'lucide-react';
import { analyzeFile, getByteInfo } from './utils';
import type { ByteInfo, FileAnalysis } from './types';
import { HexViewer } from './components/HexViewer';
import { ByteInspector } from './components/ByteInspector';
import { FileAnalysisDisplay } from './components/FileAnalysisDisplay';

export const FileHexViewer: FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [analysis, setAnalysis] = useState<FileAnalysis | null>(null);
  const [selectedByte, setSelectedByte] = useState<number | null>(null);
  const [byteInfo, setByteInfo] = useState<ByteInfo | null>(null);
  const [highlightGhosts, setHighlightGhosts] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const fileAnalysis = analyzeFile(arrayBuffer);

      setFile(selectedFile);
      setBuffer(arrayBuffer);
      setAnalysis(fileAnalysis);
      setSelectedByte(null);
      setByteInfo(null);
      setHighlightGhosts(false);

      toast.success('文件加载成功', {
        description: `${selectedFile.name} (${selectedFile.size.toLocaleString()} bytes)`,
      });
    } catch (error) {
      console.error('File read error:', error);
      toast.error('文件读取失败', {
        description: '请确保文件有效且可访问',
      });
    }
  }, []);

  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        handleFileSelect(selectedFile);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);

      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleByteClick = useCallback(
    (offset: number) => {
      if (!buffer) return;

      const bytes = new Uint8Array(buffer);
      const byte = bytes[offset];
      const info = getByteInfo(offset, byte);

      setSelectedByte(offset);
      setByteInfo(info);
    },
    [buffer]
  );

  const handleClear = useCallback(() => {
    setFile(null);
    setBuffer(null);
    setAnalysis(null);
    setSelectedByte(null);
    setByteInfo(null);
    setHighlightGhosts(false);
  }, []);

  const handleToggleGhostHighlight = useCallback(() => {
    setHighlightGhosts((prev) => !prev);
    toast.info(highlightGhosts ? '已关闭幽灵字符高亮' : '已开启幽灵字符高亮');
  }, [highlightGhosts]);

  const hasAnalysisResults = analysis && (
    analysis.magicNumber ||
    analysis.hasBOM ||
    analysis.ghostCharacters.length > 0
  );

  // 未上传文件时显示上传区域
  if (!buffer) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>文件字节透视镜</CardTitle>
            <CardDescription>
              深入文件底层，以十六进制查看任何文件，揭示文件头(Magic Number)和隐藏字符
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                flex flex-col items-center justify-center gap-4
                border-2 border-dashed rounded-lg py-12 md:py-16 px-4 text-center transition-all cursor-pointer
                ${
                  isDragging
                    ? 'border-primary bg-primary/10'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }
              `}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground/50" />
              <Label
                htmlFor="file-upload"
                className="text-base md:text-lg font-medium cursor-pointer"
              >
                拖拽文件 或 点击上传
              </Label>
              <p className="text-muted-foreground text-sm">
                支持任意格式
              </p>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 已上传文件时显示分析视图 - 使用 CSS Grid 精确控制布局
  return (
    <div
      className="p-4 max-w-7xl mx-auto"
      style={{
        height: 'calc(100vh - 4rem)',
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr',
        gap: '0.75rem',
      }}
    >
      {/* 顶部信息栏 - 自适应高度 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-lg font-semibold shrink-0">文件字节透视镜</h1>
          <Badge variant="outline" className="max-w-[200px] truncate">
            {file?.name}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {buffer.byteLength.toLocaleString()} bytes
          </span>
        </div>
        <Button onClick={handleClear} variant="outline" size="sm">
          <X className="h-4 w-4 mr-1" />
          关闭
        </Button>
      </div>

      {/* 文件分析结果 - 可折叠，默认收起，自适应高度 */}
      {hasAnalysisResults ? (
        <Collapsible open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between px-3 h-8 text-sm">
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                文件分析结果
                {analysis.magicNumber && (
                  <Badge variant="secondary" className="text-xs">
                    {analysis.magicNumber.format}
                  </Badge>
                )}
                {analysis.ghostCharacters.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {analysis.ghostCharacters.length} 个隐藏字符
                  </Badge>
                )}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isAnalysisOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <FileAnalysisDisplay
              analysis={analysis}
              fileName={file?.name || 'Unknown'}
              fileSize={buffer.byteLength}
              onHighlightGhosts={handleToggleGhostHighlight}
            />
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div className="h-0" />
      )}

      {/* 主内容区：HexViewer + Inspector - 使用剩余空间 */}
      <div
        className="flex flex-col lg:flex-row gap-4"
        style={{ minHeight: 0 }}
      >
        {/* HexViewer - 固定宽度 712px */}
        <div className="overflow-hidden flex-shrink-0" style={{ width: '712px', minHeight: '300px' }}>
          <HexViewer
            buffer={buffer}
            selectedByte={selectedByte}
            onByteClick={handleByteClick}
            ghostCharacters={analysis?.ghostCharacters || []}
            highlightGhosts={highlightGhosts}
          />
        </div>

        {/* Inspector - 自适应剩余空间 */}
        <div className="overflow-hidden flex-1 min-w-[250px]">
          <Card className="h-full flex flex-col">
            <CardHeader className="py-3 px-4 shrink-0">
              <CardTitle className="text-base">数据检查器</CardTitle>
              <CardDescription className="text-xs">
                {byteInfo
                  ? `偏移量: 0x${byteInfo.offset.toString(16).toUpperCase().padStart(8, '0')}`
                  : '点击字节查看详情'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 flex-1">
              <ByteInspector byteInfo={byteInfo} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
