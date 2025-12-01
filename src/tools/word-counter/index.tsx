import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { countWords, estimateReadingTime } from './utils';
import type { WordCountResult } from './utils';
export const WordCounter = () => {
  const [input, setInput] = useState('');
  const [stats, setStats] = useState<WordCountResult>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    chineseChars: 0,
    lines: 0,
    paragraphs: 0,
    sentences: 0,
  });
  const [readingTime, setReadingTime] = useState(0);

  // 实时统计
  useEffect(() => {
    const result = countWords(input);
    setStats(result);
    setReadingTime(estimateReadingTime(result.chineseChars, result.words));
  }, [input]);

  const handleClear = (): void => {
    setInput('');
    toast.success('已清空');
  };

  const handlePaste = async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      toast.success('已粘贴');
    } catch {
      toast.error('粘贴失败，请检查剪贴板权限');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>字数统计</CardTitle>
          <CardDescription>
            实时统计文本的字符数、单词数、行数等信息，支持中英文混合文本
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 输入区域 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="input">输入文本</Label>
              <div className="flex gap-2">
                <Button onClick={handlePaste} variant="outline" size="sm">
                  粘贴
                </Button>
                <Button onClick={handleClear} variant="outline" size="sm">
                  清空
                </Button>
              </div>
            </div>
            <Textarea
              id="input"
              placeholder="在此输入或粘贴文本..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={10}
              className="font-mono"
            />
          </div>

          {/* 统计结果 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="总字符数" value={stats.characters} />
            <StatCard label="字符数(不含空格)" value={stats.charactersNoSpaces} />
            <StatCard label="中文字符" value={stats.chineseChars} />
            <StatCard label="英文单词" value={stats.words} />
            <StatCard label="行数" value={stats.lines} />
            <StatCard label="段落数" value={stats.paragraphs} />
            <StatCard label="句子数" value={stats.sentences} />
            <StatCard label="预计阅读" value={`${readingTime} 分钟`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number | string;
}

const StatCard = ({ label, value }: StatCardProps) => {
  return (
    <div className="rounded-lg border bg-card p-4 text-center">
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
};
