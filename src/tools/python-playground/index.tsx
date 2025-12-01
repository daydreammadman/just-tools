import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Play, Trash2, RefreshCw } from 'lucide-react';
import { loadPyodideRuntime, DEFAULT_CODE } from './utils';
import type { PyodideInterface } from './types';

export const PythonPlayground = () => {
  // State
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Refs
  const pyodideRef = useRef<PyodideInterface | null>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);

  // 输出处理函数
  const handleOutput = (text: string) => {
    setOutput((prev) => [...prev, text]);
  };

  const handleError = (text: string) => {
    setOutput((prev) => [...prev, `Error: ${text}`]);
  };

  // 初始化 Pyodide
  useEffect(() => {
    const initPyodide = async () => {
      try {
        const pyodide = await loadPyodideRuntime(handleOutput, handleError);
        pyodideRef.current = pyodide;
        setIsReady(true);
        toast.success('Python 环境已就绪');
      } catch (error) {
        console.error('Pyodide loading failed:', error);
        toast.error('Python 环境加载失败，请检查网络');
      } finally {
        setIsInitializing(false);
      }
    };

    initPyodide();
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  // 运行代码
  const handleRun = async () => {
    if (!pyodideRef.current) return;

    setIsRunning(true);
    // 清空之前的单次运行输出（可选，这里选择保留历史记录，添加分割线）
    setOutput((prev) => [...prev, '>>> 运行代码...']);

    try {
      // 这里的 runPythonAsync 可以处理 top-level await
      await pyodideRef.current.runPythonAsync(code);
    } catch (error: any) {
      // 捕获 Python 异常
      setOutput((prev) => [...prev, `Traceback: ${error.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  // 清空控制台
  const handleClearConsole = () => {
    setOutput([]);
  };

  // 重置代码
  const handleResetCode = () => {
    setCode(DEFAULT_CODE);
    handleClearConsole();
  };

  // 处理 Tab 键
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      // 插入 4 个空格
      const newValue = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newValue);

      // 恢复光标位置 (需要 setTimeout 确保 React 渲染后更新)
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl h-[calc(100vh-100px)] min-h-[600px]">
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                Python 纯前端环境
                {isInitializing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {isReady && <span className="inline-block w-2 h-2 rounded-full bg-green-500" title="Ready" />}
              </CardTitle>
              <CardDescription>
                基于 Pyodide (WebAssembly)，代码在您的浏览器本地运行。
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetCode}
                disabled={!isReady || isRunning}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                重置
              </Button>
              <Button 
                onClick={handleRun} 
                disabled={!isReady || isRunning}
                className="min-w-[100px]"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    运行中
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    运行
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden pb-6">
          {/* 左侧：代码编辑器 */}
          <div className="w-full md:w-1/2 flex flex-col gap-2 h-full">
            <Label htmlFor="code-editor">代码编辑器</Label>
            <Textarea
              id="code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="在此输入 Python 代码..."
              className="flex-1 font-mono text-sm resize-none p-4 leading-relaxed tab-4"
              spellCheck={false}
            />
          </div>

          {/* 右侧：控制台输出 */}
          <div className="w-full md:w-1/2 flex flex-col gap-2 h-full">
            <div className="flex justify-between items-center">
              <Label htmlFor="console-output">终端输出</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs text-muted-foreground hover:text-destructive"
                onClick={handleClearConsole}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                清空
              </Button>
            </div>
            <div 
              id="console-output"
              className="flex-1 bg-muted/50 rounded-md border p-4 font-mono text-sm overflow-y-auto whitespace-pre-wrap break-all"
            >
              {output.length === 0 ? (
                <span className="text-muted-foreground italic select-none">
                  点击运行查看输出...
                </span>
              ) : (
                output.map((line, index) => (
                  <div 
                    key={index} 
                    className={`mb-1 ${line.startsWith('Error') || line.startsWith('Traceback') ? 'text-destructive' : ''} ${line.startsWith('>>>') ? 'text-muted-foreground font-bold border-b border-border/50 pb-1 mb-2 mt-2' : ''}`}
                  >
                    {line}
                  </div>
                ))
              )}
              {isInitializing && (
                <div className="flex items-center gap-2 text-muted-foreground mt-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  正在加载 Python 运行时资源...
                </div>
              )}
              <div ref={outputEndRef} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};