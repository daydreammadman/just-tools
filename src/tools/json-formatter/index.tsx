import { FC, useState, useCallback } from 'react';
import { Copy, Check, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  formatJSON,
  minifyJSON,
  highlightError,
  type IndentSize,
  type FormatResult,
} from './utils';

type Mode = 'format' | 'minify';

/**
 * JSON 格式化工具组件
 */
export const JSONFormatter: FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<Mode>('format');
  const [indent, setIndent] = useState<IndentSize>(2);
  const [error, setError] = useState<FormatResult['error'] | null>(null);
  const [copied, setCopied] = useState(false);

  // 处理 JSON
  const handleProcess = useCallback(() => {
    if (!input.trim()) {
      setError({ message: '请输入 JSON 内容' });
      setOutput('');
      return;
    }

    const result = mode === 'format' ? formatJSON(input, indent) : minifyJSON(input);

    if (result.success) {
      setOutput(result.output);
      setError(null);
    } else {
      setOutput('');
      setError(result.error || { message: '处理失败' });
    }
  }, [input, mode, indent]);

  // 清空
  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
  }, []);

  // 复制结果
  const handleCopy = useCallback(async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('复制失败:', e);
    }
  }, [output]);

  // 渲染错误高亮
  const renderErrorHighlight = () => {
    if (!error || !input) return null;

    const { before, error: errorPart, after } = highlightError(
      input,
      error.position,
      error.line
    );

    if (!errorPart) return null;

    return (
      <div className="mt-2 max-h-32 overflow-auto rounded border border-destructive/50 bg-destructive/5 p-3 font-mono text-sm">
        <span className="text-muted-foreground">{before}</span>
        <span className="bg-destructive text-destructive-foreground px-0.5">{errorPart}</span>
        <span className="text-muted-foreground">{after}</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto ">
      <div className="rounded-lg ">
        {/* 头部 */}
        <div className="border-b p-4">
          <h1 className="text-xl font-semibold">JSON 格式化</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            格式化、压缩和验证 JSON 数据
          </p>
        </div>

        {/* 工具栏 */}
        <div className="flex flex-wrap items-center gap-4 border-b p-4">
          {/* 模式切换 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">模式:</span>
            <div className="flex rounded-lg border bg-muted p-1">
              <button
                onClick={() => setMode('format')}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  mode === 'format'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                格式化
              </button>
              <button
                onClick={() => setMode('minify')}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  mode === 'minify'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                压缩
              </button>
            </div>
          </div>

          {/* 缩进选择（仅格式化模式） */}
          {mode === 'format' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">缩进:</span>
              <div className="flex rounded-lg border bg-muted p-1">
                <button
                  onClick={() => setIndent(2)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    indent === 2
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  2 空格
                </button>
                <button
                  onClick={() => setIndent(4)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    indent === 4
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  4 空格
                </button>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center gap-2 ml-auto">
            <Button onClick={handleProcess}>
              {mode === 'format' ? '格式化' : '压缩'}
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <Trash2 className="h-4 w-4 mr-1" />
              清空
            </Button>
          </div>
        </div>

        {/* 内容区 */}
        <div className="grid gap-4 p-4 md:grid-cols-2">
          {/* 输入区 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">输入</label>
              <span className="text-xs text-muted-foreground">
                {input.length} 字符
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
              placeholder='{"key": "value"}'
              className={cn(
                'h-80 w-full resize-none rounded-md border bg-background p-3 font-mono text-sm',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                error && 'border-destructive focus:ring-destructive'
              )}
              spellCheck={false}
            />

            {/* 错误提示 */}
            {error && (
              <div className="space-y-1">
                <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-destructive">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">JSON 语法错误</p>
                    <p className="mt-1 text-destructive/80">{error.message}</p>
                    {(error.line || error.position !== undefined) && (
                      <p className="mt-1 text-xs text-destructive/60">
                        {error.line && `行 ${error.line}`}
                        {error.line && error.column && ', '}
                        {error.column && `列 ${error.column}`}
                        {error.position !== undefined && ` (位置 ${error.position})`}
                      </p>
                    )}
                  </div>
                </div>
                {renderErrorHighlight()}
              </div>
            )}
          </div>

          {/* 输出区 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">输出</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {output.length} 字符
                </span>
                {output && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 px-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1 text-green-500" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        复制
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="处理结果将显示在这里..."
              className={cn(
                'h-80 w-full resize-none rounded-md border bg-muted/50 p-3 font-mono text-sm',
                'focus:outline-none'
              )}
              spellCheck={false}
            />
          </div>
        </div>

        {/* 底部提示 */}
        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground">
            提示: 输入 JSON 后点击"{mode === 'format' ? '格式化' : '压缩'}"按钮处理，支持自动检测语法错误并高亮显示错误位置。
          </p>
        </div>
      </div>
    </div>
  );
};
