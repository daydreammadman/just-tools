import type { AlgorithmCategory, OperationDirection } from './types';
import { useState, useCallback, useEffect } from 'react';
import {
  Copy,
  Check,
  Trash2,
  ArrowRightLeft,
  Hash,
  FileCode,
  Lock,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  algorithms,
  algorithmCategories,
  getAlgorithmsByCategory,
  processEncode,
  processDecode,
} from './utils';

/**
 * 分类图标映射
 */
const categoryIcons: Record<AlgorithmCategory, React.ComponentType<{ className?: string }>> = {
  hash: Hash,
  encoding: FileCode,
  cipher: Lock,
};

/**
 * 自定义滚动条样式类
 */
const scrollbarStyles = cn(
  '[&::-webkit-scrollbar]:w-1.5',
  '[&::-webkit-scrollbar-track]:bg-transparent',
  '[&::-webkit-scrollbar-thumb]:rounded-full',
  '[&::-webkit-scrollbar-thumb]:bg-border',
  'hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50'
);

/**
 * 加密解密工具主组件
 */
export const CryptoTool = () => {
  // 状态管理
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('base64');
  const [direction, setDirection] = useState<OperationDirection>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'hex' | 'base64'>('hex');
  const [autoProcess, setAutoProcess] = useState(true);

  // 获取当前算法信息
  const currentAlgorithm = algorithms[selectedAlgorithm];

  // 处理函数
  const handleProcess = useCallback(async (): Promise<void> => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const options = {
        key: key || undefined,
        outputFormat,
      };

      const result =
        direction === 'encode'
          ? await processEncode(selectedAlgorithm, input, options)
          : await processDecode(selectedAlgorithm, input, options);

      if (result.success) {
        setOutput(result.output);
        setError(null);
      } else {
        setOutput('');
        setError(result.error || '处理失败');
      }
    } catch (err) {
      setOutput('');
      setError(err instanceof Error ? err.message : '处理失败');
    } finally {
      setIsProcessing(false);
    }
  }, [input, selectedAlgorithm, direction, key, outputFormat]);

  // 自动处理（输入变化时）
  useEffect(() => {
    if (autoProcess) {
      const timer = setTimeout(() => {
        handleProcess();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [input, selectedAlgorithm, direction, key, outputFormat, autoProcess, handleProcess]);

  // 切换算法时重置状态
  const handleAlgorithmChange = (algorithmId: string): void => {
    setSelectedAlgorithm(algorithmId);
    const algo = algorithms[algorithmId];

    // 如果新算法不支持解码，切换到编码模式
    if (!algo.supportsDecode && direction === 'decode') {
      setDirection('encode');
    }

    // 如果新算法不需要密钥，清空密钥
    if (!algo.requiresKey) {
      setKey('');
    }

    setOutput('');
    setError(null);
  };

  // 交换输入输出
  const handleSwap = (): void => {
    if (!currentAlgorithm.supportsDecode) {
      toast.error('该算法不支持解码');
      return;
    }
    const temp = input;
    setInput(output);
    setOutput(temp);
    setDirection((prev) => (prev === 'encode' ? 'decode' : 'encode'));
  };

  // 清空
  const handleClear = (): void => {
    setInput('');
    setOutput('');
    setError(null);
    setKey('');
  };

  // 复制结果
  const handleCopy = async (): Promise<void> => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('复制失败');
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* 头部 - 固定 */}
      <div className="shrink-0 border-b p-4">
        <h1 className="text-xl font-semibold">加密解密工具</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          支持多种哈希、编码和加密算法
        </p>
      </div>

      {/* 主内容区 - 自适应填充 */}
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-auto p-4 lg:flex-row lg:overflow-hidden">
        {/* 左侧：算法选择器 */}
        <div
          className={cn(
            'shrink-0 space-y-3 lg:w-64 lg:overflow-y-auto lg:pr-2',
            scrollbarStyles
          )}
        >
          {/* 算法分类 - 移动端横向滚动，桌面端垂直 */}
          {algorithmCategories.map((category) => {
            const CategoryIcon = categoryIcons[category.id];
            const categoryAlgorithms = getAlgorithmsByCategory(category.id);

            return (
              <div key={category.id} className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <CategoryIcon className="h-3.5 w-3.5" />
                  <span>{category.name}</span>
                </div>
                {/* 移动端横向滚动，桌面端网格 */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 lg:grid lg:grid-cols-1 lg:overflow-x-visible lg:pb-0">
                  {categoryAlgorithms.map((algo) => (
                    <button
                      key={algo.id}
                      onClick={() => handleAlgorithmChange(algo.id)}
                      className={cn(
                        'shrink-0 rounded-md border px-2.5 py-2 text-left transition-all hover:bg-accent lg:w-full',
                        selectedAlgorithm === algo.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      )}
                    >
                      <span className="whitespace-nowrap text-sm font-medium">{algo.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* 输出格式选择（仅哈希算法） */}
          {currentAlgorithm.category === 'hash' && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">输出格式</Label>
              <div className="flex rounded-md border bg-muted p-0.5">
                <button
                  onClick={() => setOutputFormat('hex')}
                  className={cn(
                    'flex-1 rounded px-2 py-1 text-xs font-medium transition-colors',
                    outputFormat === 'hex'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Hex
                </button>
                <button
                  onClick={() => setOutputFormat('base64')}
                  className={cn(
                    'flex-1 rounded px-2 py-1 text-xs font-medium transition-colors',
                    outputFormat === 'base64'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Base64
                </button>
              </div>
            </div>
          )}

          {/* 自动处理开关 */}
          <div className="flex items-center justify-between rounded-md border px-2.5 py-2">
            <Label htmlFor="auto-process" className="text-xs cursor-pointer">
              实时处理
            </Label>
            <Switch
              id="auto-process"
              checked={autoProcess}
              onCheckedChange={setAutoProcess}
            />
          </div>
        </div>

        {/* 右侧：输入输出区域 */}
        <div
          className={cn(
            'flex   min-h-0 flex-1 flex-col gap-3 lg:overflow-y-auto',
            scrollbarStyles
          )}
        >
          {/* 方向控制栏 */}
          <div className="flex shrink-0 flex-wrap items-center gap-3 rounded-md border bg-muted/30 p-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">模式:</span>
              <div className="flex rounded-md border bg-background p-0.5">
                <button
                  onClick={() => setDirection('encode')}
                  className={cn(
                    'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                    direction === 'encode'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {currentAlgorithm.category === 'hash' ? '计算' : '编码/加密'}
                </button>
                {currentAlgorithm.supportsDecode && (
                  <button
                    onClick={() => setDirection('decode')}
                    className={cn(
                      'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                      direction === 'decode'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    解码/解密
                  </button>
                )}
              </div>
            </div>

            {/* 交换按钮 */}
            {currentAlgorithm.supportsDecode && output && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSwap}
                className="h-7 gap-1 px-2 text-xs"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                交换
              </Button>
            )}

            {/* 操作按钮 */}
            <div className="ml-auto flex items-center gap-2">
              {!autoProcess && (
                <Button
                  size="sm"
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="h-7 text-xs"
                >
                  {isProcessing ? '处理中...' : '处理'}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="h-7 text-xs"
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                清空
              </Button>
            </div>
          </div>

          {/* 密钥输入（如果需要） */}
          {currentAlgorithm.requiresKey && (
            <div className="shrink-0 space-y-1.5">
              <Label htmlFor="key" className="flex items-center gap-1.5 text-xs">
                <Lock className="h-3.5 w-3.5" />
                密钥
              </Label>
              <div className="relative">
                <Input
                  id="key"
                  type={showKey ? 'text' : 'password'}
                  placeholder={currentAlgorithm.keyPlaceholder || '输入密钥...'}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="h-8 pr-8 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 输入输出区域 - 自适应高度 */}
          <div className="grid min-h-0 flex-1 gap-3 grid-cols-1 md:grid-cols-2 ">
            {/* 输入区 */}
            <div className="ml-1 flex min-h-32 flex-col gap-1.5 md:min-h-40">
              <div className="flex shrink-0 items-center justify-between">
                <Label htmlFor="input" className="text-xs">
                  {direction === 'encode' ? '原文' : '密文/编码'}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {input.length} 字符
                </span>
              </div>
              <textarea
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  direction === 'encode'
                    ? '输入要处理的内容...'
                    : '输入要解码/解密的内容...'
                }
                className={cn(
                  'min-h-0 flex-1 resize-none rounded-md border bg-background p-2.5 font-mono text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  error && 'border-destructive focus:ring-destructive'
                )}
                spellCheck={false}
              />
            </div>

            {/* 输出区 */}
            <div className="flex min-h-32 flex-col gap-1.5 md:min-h-40 ">
              <div className="flex shrink-0 items-center justify-between">
                <Label htmlFor="output" className="text-xs">
                  {direction === 'encode'
                    ? currentAlgorithm.category === 'hash'
                      ? '哈希值'
                      : '结果'
                    : '原文'}
                </Label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    {output.length} 字符
                  </span>
                  {output && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-6 px-1.5 text-xs"
                    >
                      {copied ? (
                        <>
                          <Check className="mr-0.5 h-3 w-3 text-green-500" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="mr-0.5 h-3 w-3" />
                          复制
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <textarea
                id="output"
                value={output}
                readOnly
                placeholder={
                  isProcessing
                    ? '处理中...'
                    : error
                      ? ''
                      : '处理结果将显示在这里...'
                }
                className={cn(
                  'min-h-0 flex-1 resize-none rounded-md border bg-muted/50 p-2.5 font-mono text-sm',
                  'focus:outline-none'
                )}
                spellCheck={false}
              />
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="flex shrink-0 items-start gap-2 rounded-md bg-destructive/10 p-2.5 text-destructive">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p className="text-xs">{error}</p>
            </div>
          )}

          {/* 算法说明 - 仅在桌面端显示 */}
          <div className="hidden shrink-0 rounded-md border bg-muted/30 p-2.5 md:block">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">{currentAlgorithm.name}</span>
              <span className="text-xs text-muted-foreground">
                {currentAlgorithm.description}
              </span>
              <div className="ml-auto flex shrink-0 gap-1.5">
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-xs',
                    currentAlgorithm.supportsDecode
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-amber-500/10 text-amber-600'
                  )}
                >
                  {currentAlgorithm.supportsDecode ? '可逆' : '不可逆'}
                </span>
                {currentAlgorithm.requiresKey && (
                  <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 text-xs text-blue-600">
                    需密钥
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
      </div>
      {/* 输出描述 - 移动端显示在输出下方 */}
      <div className="mt-1.5 rounded-md border bg-muted/30 p-2 md:hidden">
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium">{currentAlgorithm.name}</span>
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5',
                currentAlgorithm.supportsDecode
                  ? 'bg-green-500/10 text-green-600'
                  : 'bg-amber-500/10 text-amber-600'
              )}
            >
              {currentAlgorithm.supportsDecode ? '可逆' : '不可逆'}
            </span>
            {currentAlgorithm.requiresKey && (
              <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 text-blue-600">
                需密钥
              </span>
            )}
          </div>
          <span className="text-muted-foreground">{currentAlgorithm.description}</span>
        </div>
      </div>
      {/* 底部提示 - 固定 */}
      <div className="shrink-0 border-t px-4 py-2">
        <p className="text-xs text-muted-foreground">
          所有处理均在本地完成，不会上传到服务器。
        </p>
      </div>
    </div>
  );
};
