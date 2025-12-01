/**
 * File Analysis 组件 - 显示文件分析结果
 */

import type { FC } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileType, Ghost } from 'lucide-react';
import type { FileAnalysis } from '../types';

interface FileAnalysisDisplayProps {
  analysis: FileAnalysis;
  fileName: string;
  fileSize: number;
  onHighlightGhosts: () => void;
}

export const FileAnalysisDisplay: FC<FileAnalysisDisplayProps> = ({
  analysis,
  fileName,
  fileSize,
  onHighlightGhosts,
}) => {
  return (
    <div className="space-y-4">
      {/* 文件信息 */}
      <div className="flex items-center gap-4 text-sm flex-wrap">
        <Badge variant="outline">
          {fileName}
        </Badge>
        <span className="text-muted-foreground">
          {fileSize.toLocaleString()} bytes
        </span>
        <span className="text-muted-foreground">
          {analysis.detectedEncoding}
        </span>
      </div>

      {/* Magic Number 检测结果 */}
      {analysis.magicNumber && (
        <Alert>
          <FileType className="h-4 w-4" />
          <AlertTitle>
            检测到文件类型: {analysis.magicNumber.format}
          </AlertTitle>
          <AlertDescription className="text-muted-foreground">
            {analysis.magicNumber.description}
          </AlertDescription>
        </Alert>
      )}

      {/* BOM 检测 */}
      {analysis.hasBOM && (
        <Alert variant="default">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            检测到 BOM (Byte Order Mark)
          </AlertTitle>
          <AlertDescription className="text-muted-foreground">
            文件开头包含字节序标记
          </AlertDescription>
        </Alert>
      )}

      {/* 幽灵字符检测结果 */}
      {analysis.ghostCharacters.length > 0 && (
        <Alert variant="destructive">
          <Ghost className="h-4 w-4" />
          <AlertTitle>
            检测到 {analysis.ghostCharacters.length} 个幽灵字符
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <div>
              发现隐藏的零宽字符或特殊控制字符，可能影响文本显示或处理。
            </div>
            <div className="space-y-1 mt-2">
              {analysis.ghostCharacters.slice(0, 5).map((ghost, index) => (
                <div key={index} className="text-xs font-mono">
                  位置 {ghost.position}: {ghost.description}
                </div>
              ))}
              {analysis.ghostCharacters.length > 5 && (
                <div className="text-xs">
                  还有 {analysis.ghostCharacters.length - 5} 个...
                </div>
              )}
            </div>
            <Button
              onClick={onHighlightGhosts}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              在视图中高亮显示
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
