import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Clock,
  Copy,
  RefreshCw,
  Calendar,
  Info,
} from 'lucide-react';
import type { TimestampUnit, DateFormat } from './utils';
import {
  timestampToDate,
  dateToTimestamp,
  getCurrentTimestamp,
  isValidTimestamp,
  isValidDateString,
  detectTimestampUnit,
  getRelativeTime,
  batchTimestampToDate,
  formatDate,
} from './utils';

export const TimestampConverter: FC = () => {
  // 时间戳转日期
  const [timestampInput, setTimestampInput] = useState('');
  const [timestampUnit, setTimestampUnit] = useState<TimestampUnit>('milliseconds');
  const [dateOutput, setDateOutput] = useState('');
  const [relativeTime, setRelativeTime] = useState('');
  const [autoDetectedUnit, setAutoDetectedUnit] = useState<TimestampUnit | null>(null);

  // 日期转时间戳
  const [dateInput, setDateInput] = useState('');
  const [dateToTsUnit, setDateToTsUnit] = useState<TimestampUnit>('milliseconds');
  const [timestampOutput, setTimestampOutput] = useState('');

  // 当前时间戳
  const [currentTimestamp, setCurrentTimestamp] = useState({
    seconds: 0,
    milliseconds: 0,
    microseconds: 0,
    nanoseconds: 0,
  });
  const [currentDate, setCurrentDate] = useState('');

  // 批量转换
  const [batchInput, setBatchInput] = useState('');
  const [batchUnit, setBatchUnit] = useState<TimestampUnit>('milliseconds');
  const [batchOutput, setBatchOutput] = useState('');

  // 日期格式
  const [dateFormat, setDateFormat] = useState<DateFormat>('full');

  // 更新当前时间戳
  useEffect(() => {
    const updateCurrentTime = (): void => {
      const now = Date.now();
      setCurrentTimestamp({
        seconds: getCurrentTimestamp('seconds'),
        milliseconds: getCurrentTimestamp('milliseconds'),
        microseconds: getCurrentTimestamp('microseconds'),
        nanoseconds: getCurrentTimestamp('nanoseconds'),
      });
      setCurrentDate(formatDate(new Date(now), 'full'));
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // 时间戳转日期
  const handleTimestampConvert = (): void => {
    try {
      if (!timestampInput.trim()) {
        toast.error('请输入时间戳');
        return;
      }

      if (!isValidTimestamp(timestampInput)) {
        toast.error('时间戳格式无效');
        return;
      }

      // 自动检测单位
      const detected = detectTimestampUnit(timestampInput);
      setAutoDetectedUnit(detected);

      const result = timestampToDate(timestampInput, timestampUnit, dateFormat);
      setDateOutput(result);

      // 计算相对时间
      const ts = parseInt(timestampInput, 10);
      const relative = getRelativeTime(ts, timestampUnit);
      setRelativeTime(relative);

      toast.success('转换成功');
    } catch (error) {
      console.error('Timestamp conversion error:', error);
      toast.error(error instanceof Error ? error.message : '转换失败');
      setDateOutput('');
      setRelativeTime('');
    }
  };

  // 日期转时间戳
  const handleDateConvert = (): void => {
    try {
      if (!dateInput.trim()) {
        toast.error('请输入日期时间');
        return;
      }

      if (!isValidDateString(dateInput)) {
        toast.error('日期格式无效');
        return;
      }

      const result = dateToTimestamp(dateInput, dateToTsUnit);
      setTimestampOutput(result.toString());

      toast.success('转换成功');
    } catch (error) {
      console.error('Date conversion error:', error);
      toast.error(error instanceof Error ? error.message : '转换失败');
      setTimestampOutput('');
    }
  };

  // 批量转换
  const handleBatchConvert = (): void => {
    try {
      if (!batchInput.trim()) {
        toast.error('请输入时间戳列表');
        return;
      }

      const timestamps = batchInput
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (timestamps.length === 0) {
        toast.error('请输入有效的时间戳');
        return;
      }

      const results = batchTimestampToDate(timestamps, batchUnit, dateFormat);

      const output = results
        .map((result) => {
          if (result.error) {
            return `${result.input} -> 错误: ${result.error}`;
          }
          return `${result.input} -> ${result.output}`;
        })
        .join('\n');

      setBatchOutput(output);

      const successCount = results.filter((r) => !r.error).length;
      toast.success(`成功转换 ${successCount}/${results.length} 条记录`);
    } catch (error) {
      console.error('Batch conversion error:', error);
      toast.error('批量转换失败');
    }
  };

  // 复制到剪贴板
  const handleCopy = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('已复制到剪贴板');
    } catch (error) {
      toast.error('复制失败');
    }
  };

  // 使用当前时间戳
  const useCurrentTimestamp = (unit: TimestampUnit): void => {
    const ts = getCurrentTimestamp(unit);
    setTimestampInput(ts.toString());
    setTimestampUnit(unit);
  };

  // 使用当前日期
  const useCurrentDate = (): void => {
    const now = new Date();
    // 格式化为 datetime-local 输入格式
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setDateInput(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <div className="space-y-4">
        {/* 当前时间戳 - 紧凑版 */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              {currentDate}
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(currentTimestamp).map(([unit, value]) => (
                <button
                  key={unit}
                  onClick={() => useCurrentTimestamp(unit as TimestampUnit)}
                  className="px-3 py-1 text-xs rounded bg-background border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                  title={`使用当前${unit === 'seconds' ? '秒' : unit === 'milliseconds' ? '毫秒' : unit === 'microseconds' ? '微秒' : '纳秒'}时间戳`}
                >
                  <span className="font-mono font-semibold">{value.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-1">
                    {unit === 'seconds' && 's'}
                    {unit === 'milliseconds' && 'ms'}
                    {unit === 'microseconds' && 'μs'}
                    {unit === 'nanoseconds' && 'ns'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 主要转换功能 */}
        <Tabs defaultValue="timestamp-to-date" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timestamp-to-date">时间戳 → 日期</TabsTrigger>
            <TabsTrigger value="date-to-timestamp">日期 → 时间戳</TabsTrigger>
            <TabsTrigger value="batch">批量转换</TabsTrigger>
          </TabsList>

          {/* 时间戳转日期 */}
          <TabsContent value="timestamp-to-date" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="timestamp-unit" className="text-xs">单位</Label>
                <Select
                  value={timestampUnit}
                  onValueChange={(value) => setTimestampUnit(value as TimestampUnit)}
                >
                  <SelectTrigger id="timestamp-unit" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seconds">秒 (10位)</SelectItem>
                    <SelectItem value="milliseconds">毫秒 (13位)</SelectItem>
                    <SelectItem value="microseconds">微秒 (16位)</SelectItem>
                    <SelectItem value="nanoseconds">纳秒 (19位)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date-format" className="text-xs">格式</Label>
                <Select
                  value={dateFormat}
                  onValueChange={(value) => setDateFormat(value as DateFormat)}
                >
                  <SelectTrigger id="date-format" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">完整</SelectItem>
                    <SelectItem value="iso">ISO 8601</SelectItem>
                    <SelectItem value="date-only">仅日期</SelectItem>
                    <SelectItem value="time-only">仅时间</SelectItem>
                    <SelectItem value="custom">自定义</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="timestamp-input" className="text-xs">时间戳</Label>
              <div className="flex gap-2">
                <Input
                  id="timestamp-input"
                  type="text"
                  placeholder="1234567890"
                  value={timestampInput}
                  onChange={(e) => setTimestampInput(e.target.value)}
                  className="font-mono h-9"
                />
                <Button
                  onClick={() => useCurrentTimestamp(timestampUnit)}
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  title="当前时间"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
              {autoDetectedUnit && autoDetectedUnit !== timestampUnit && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Info className="h-3 w-3" />
                  <span>
                    检测到
                    <Badge variant="outline" className="mx-1 text-xs h-5">
                      {autoDetectedUnit === 'seconds' && '秒'}
                      {autoDetectedUnit === 'milliseconds' && '毫秒'}
                      {autoDetectedUnit === 'microseconds' && '微秒'}
                      {autoDetectedUnit === 'nanoseconds' && '纳秒'}
                    </Badge>
                    级
                  </span>
                </div>
              )}
            </div>

            <Button onClick={handleTimestampConvert} className="w-full h-9">
              转换
            </Button>

            {dateOutput && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">结果</Label>
                  <Button
                    onClick={() => handleCopy(dateOutput)}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    复制
                  </Button>
                </div>
                <Input
                  value={dateOutput}
                  readOnly
                  className="font-mono bg-muted h-9"
                />
                {relativeTime && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
                    <Calendar className="h-3 w-3" />
                    <span>{relativeTime}</span>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* 日期转时间戳 */}
          <TabsContent value="date-to-timestamp" className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="date-to-ts-unit" className="text-xs">单位</Label>
              <Select
                value={dateToTsUnit}
                onValueChange={(value) => setDateToTsUnit(value as TimestampUnit)}
              >
                <SelectTrigger id="date-to-ts-unit" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seconds">秒</SelectItem>
                  <SelectItem value="milliseconds">毫秒</SelectItem>
                  <SelectItem value="microseconds">微秒</SelectItem>
                  <SelectItem value="nanoseconds">纳秒</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date-input" className="text-xs">日期时间</Label>
              <div className="flex gap-2">
                <Input
                  id="date-input"
                  type="datetime-local"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="h-9"
                />
                <Button
                  onClick={useCurrentDate}
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  title="当前时间"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <Button onClick={handleDateConvert} className="w-full h-9">
              转换
            </Button>

            {timestampOutput && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">结果</Label>
                  <Button
                    onClick={() => handleCopy(timestampOutput)}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    复制
                  </Button>
                </div>
                <Input
                  value={timestampOutput}
                  readOnly
                  className="font-mono bg-muted h-9"
                />
              </div>
            )}
          </TabsContent>

          {/* 批量转换 */}
          <TabsContent value="batch" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="batch-unit" className="text-xs">单位</Label>
                <Select
                  value={batchUnit}
                  onValueChange={(value) => setBatchUnit(value as TimestampUnit)}
                >
                  <SelectTrigger id="batch-unit" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seconds">秒</SelectItem>
                    <SelectItem value="milliseconds">毫秒</SelectItem>
                    <SelectItem value="microseconds">微秒</SelectItem>
                    <SelectItem value="nanoseconds">纳秒</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="batch-format" className="text-xs">格式</Label>
                <Select
                  value={dateFormat}
                  onValueChange={(value) => setDateFormat(value as DateFormat)}
                >
                  <SelectTrigger id="batch-format" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">完整</SelectItem>
                    <SelectItem value="iso">ISO 8601</SelectItem>
                    <SelectItem value="date-only">仅日期</SelectItem>
                    <SelectItem value="time-only">仅时间</SelectItem>
                    <SelectItem value="custom">自定义</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="batch-input" className="text-xs">时间戳列表（每行一个）</Label>
              <Textarea
                id="batch-input"
                placeholder="1234567890&#10;1234567891&#10;1234567892"
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleBatchConvert} className="flex-1 h-9">
                批量转换
              </Button>
              <Button
                onClick={() => {
                  setBatchInput('');
                  setBatchOutput('');
                }}
                variant="outline"
                className="h-9"
              >
                清空
              </Button>
            </div>

            {batchOutput && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">结果</Label>
                  <Button
                    onClick={() => handleCopy(batchOutput)}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    复制
                  </Button>
                </div>
                <Textarea
                  value={batchOutput}
                  readOnly
                  rows={8}
                  className="font-mono text-sm bg-muted"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
