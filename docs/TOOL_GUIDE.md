# Just Tools - 工具开发指南

本指南帮助你快速开发和集成新工具到 Just Tools 平台。

---

## 快速开始

### 创建新工具的步骤

1. **规划工具**：确定工具的功能、输入输出
2. **创建目录**：在 `src/tools/` 下创建工具目录
3. **开发组件**：编写工具的 React 组件
4. **配置工具**：添加工具配置文件
5. **注册工具**：在工具注册中心注册
6. **测试工具**：验证功能正常
7. **提交代码**：遵循 Git 提交规范

---

## 工具开发模板

### 目录结构

```
src/tools/your-tool-name/
├── index.tsx           # 工具主组件（必需）
├── config.ts           # 工具配置（必需）
├── utils.ts            # 工具辅助函数（可选）
├── types.ts            # 类型定义（可选）
├── components/         # 子组件（可选）
│   └── SubComponent.tsx
└── README.md           # 工具说明（推荐）
```

### 1. 创建工具配置 (config.ts)

```typescript
import { ToolConfig } from '@/tools/types';
import { Clock } from 'lucide-react';
import { YourToolComponent } from './index';

export const toolConfig: ToolConfig = {
  // 唯一标识符，使用 kebab-case
  id: 'your-tool-name',

  // 工具名称（简短）
  name: 'Your Tool Name',

  // 工具描述（一句话说明功能）
  description: 'Brief description of what this tool does',

  // 工具分类
  category: 'conversion', // text | network | conversion | crypto | development | utilities

  // 图标（使用 lucide-react 图标）
  icon: Clock,

  // 搜索标签（帮助用户找到工具）
  tags: ['tag1', 'tag2', 'keyword'],

  // 工具组件
  component: YourToolComponent,

  // 是否需要后端支持
  requiresBackend: false, // true 表示需要调用后端 API

  // 版本号
  version: '1.0.0',

  // 作者信息（可选）
  author: 'Your Name',

  // 示例数据（可选，用于演示）
  examples: [
    {
      input: 'example input',
      output: 'example output'
    }
  ]
};
```

### 2. 创建工具组件 (index.tsx)

#### 纯前端工具模板

```tsx
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useClipboard } from '@/hooks/useClipboard';
import { toast } from 'sonner';

interface YourToolProps {
  // 可选的外部传入参数
}

export const YourToolComponent = (props: YourToolProps) => {
  // 状态管理
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 使用自定义 Hook
  const { copyToClipboard } = useClipboard();

  // 核心处理逻辑
  const handleProcess = () => {
    try {
      setIsLoading(true);

      // 输入验证
      if (!input.trim()) {
        toast.error('请输入内容');
        return;
      }

      // 处理逻辑
      const result = processInput(input);
      setOutput(result);

      toast.success('处理成功');
    } catch (error) {
      console.error('Process error:', error);
      toast.error('处理失败，请检查输入');
    } finally {
      setIsLoading(false);
    }
  };

  // 工具函数
  const processInput = (value: string): string => {
    // 实现你的处理逻辑
    return value.toUpperCase();
  };

  // 清空操作
  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  // 复制结果
  const handleCopy = () => {
    copyToClipboard(output);
    toast.success('已复制到剪贴板');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Your Tool Name</CardTitle>
          <CardDescription>
            Tool description and usage instructions
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 输入区域 */}
          <div className="space-y-2">
            <Label htmlFor="input">输入</Label>
            <Textarea
              id="input"
              placeholder="请输入内容..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
              className="font-mono"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              onClick={handleProcess}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? '处理中...' : '处理'}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
            >
              清空
            </Button>
          </div>

          {/* 输出区域 */}
          {output && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="output">输出</Label>
                <Button
                  onClick={handleCopy}
                  variant="ghost"
                  size="sm"
                >
                  复制
                </Button>
              </div>
              <Textarea
                id="output"
                value={output}
                readOnly
                rows={6}
                className="font-mono bg-muted"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
```

#### 需要后端的工具模板

```tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { fetchToolAPI } from '@/services/toolsAPI';

interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const YourToolComponent = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // 调用后端 API
      const response = await fetchToolAPI<APIResponse>('/your-tool/process', {
        method: 'POST',
        body: JSON.stringify({ input })
      });

      if (response.success) {
        setResult(response.data);
        toast.success('查询成功');
      } else {
        toast.error(response.error || '查询失败');
      }
    } catch (error) {
      console.error('API error:', error);
      toast.error('网络请求失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Your Tool Name</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入..."
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? '查询中...' : '查询'}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <pre className="text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
```

### 3. 创建类型定义 (types.ts)

```typescript
// 工具特定的类型定义
export interface YourToolInput {
  value: string;
  options?: {
    format?: string;
    encoding?: string;
  };
}

export interface YourToolOutput {
  result: string;
  metadata?: {
    timestamp: number;
    processingTime: number;
  };
}

// API 响应类型
export interface YourToolAPIResponse {
  success: boolean;
  data?: YourToolOutput;
  error?: {
    code: string;
    message: string;
  };
}
```

### 4. 创建工具函数 (utils.ts)

```typescript
/**
 * 工具核心处理函数
 * @param input - 输入数据
 * @returns 处理后的结果
 */
export function processData(input: string): string {
  // 输入验证
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input');
  }

  // 处理逻辑
  const result = input.trim().toUpperCase();

  return result;
}

/**
 * 数据验证函数
 * @param input - 待验证数据
 * @returns 是否有效
 */
export function validateInput(input: string): boolean {
  // 验证逻辑
  return input.length > 0 && input.length < 10000;
}

/**
 * 格式化输出
 * @param data - 原始数据
 * @returns 格式化后的字符串
 */
export function formatOutput(data: any): string {
  return JSON.stringify(data, null, 2);
}
```

### 5. 注册工具

在 `src/tools/index.ts` 中注册你的工具：

```typescript
import { ToolConfig } from './types';
import { toolConfig as ipLookup } from './ip-lookup/config';
import { toolConfig as jsonFormatter } from './json-formatter/config';
import { toolConfig as yourTool } from './your-tool-name/config'; // 导入你的工具

// 工具注册表
export const allTools: ToolConfig[] = [
  ipLookup,
  jsonFormatter,
  yourTool, // 添加你的工具
];

// 根据 ID 获取工具
export function getToolById(id: string): ToolConfig | undefined {
  return allTools.find(tool => tool.id === id);
}

// 根据分类获取工具
export function getToolsByCategory(category: string): ToolConfig[] {
  return allTools.filter(tool => tool.category === category);
}

// 搜索工具
export function searchTools(query: string): ToolConfig[] {
  const lowerQuery = query.toLowerCase();
  return allTools.filter(tool =>
    tool.name.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery) ||
    tool.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
```

### 6. 创建工具类型定义

在 `src/tools/types.ts` 中定义通用类型（如果还没有）：

```typescript
import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';

export type ToolCategory =
  | 'text'
  | 'network'
  | 'conversion'
  | 'crypto'
  | 'development'
  | 'utilities';

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: LucideIcon;
  tags: string[];
  component: ComponentType;
  requiresBackend: boolean;
  version: string;
  author?: string;
  examples?: Array<{
    input: string;
    output: string;
  }>;
}

export interface ToolMetadata {
  usageCount?: number;
  lastUsed?: number;
  isFavorite?: boolean;
}
```

---

## 实战示例：时间戳转换器

让我们创建一个完整的时间戳转换工具作为示例。

### 1. 创建目录结构

```bash
mkdir -p src/tools/timestamp-converter
```

### 2. config.ts

```typescript
import { ToolConfig } from '@/tools/types';
import { Clock } from 'lucide-react';
import { TimestampConverter } from './index';

export const toolConfig: ToolConfig = {
  id: 'timestamp-converter',
  name: '时间戳转换',
  description: '在 Unix 时间戳和可读日期之间相互转换',
  category: 'conversion',
  icon: Clock,
  tags: ['时间', 'timestamp', '日期', 'date', 'unix'],
  component: TimestampConverter,
  requiresBackend: false,
  version: '1.0.0',
  examples: [
    {
      input: '1638360000',
      output: '2021-12-01 12:00:00'
    }
  ]
};
```

### 3. index.tsx

```tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatTimestamp, parseDate, getCurrentTimestamp } from './utils';
import { toast } from 'sonner';

export const TimestampConverter = () => {
  const [timestamp, setTimestamp] = useState('');
  const [dateString, setDateString] = useState('');
  const [currentTime, setCurrentTime] = useState(getCurrentTimestamp());

  // 实时更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimestamp());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 时间戳转日期
  const handleTimestampToDate = () => {
    try {
      const date = formatTimestamp(Number(timestamp));
      toast.success('转换成功');
      setDateString(date);
    } catch (error) {
      toast.error('无效的时间戳');
    }
  };

  // 日期转时间戳
  const handleDateToTimestamp = () => {
    try {
      const ts = parseDate(dateString);
      toast.success('转换成功');
      setTimestamp(String(ts));
    } catch (error) {
      toast.error('无效的日期格式');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>时间戳转换器</CardTitle>
          <CardDescription>
            在 Unix 时间戳和可读日期格式之间相互转换
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 当前时间 */}
          <div className="p-4 bg-primary/10 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">当前时间戳</div>
            <div className="text-2xl font-mono font-bold">{currentTime}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {formatTimestamp(currentTime)}
            </div>
          </div>

          <Tabs defaultValue="to-date">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="to-date">时间戳 → 日期</TabsTrigger>
              <TabsTrigger value="to-timestamp">日期 → 时间戳</TabsTrigger>
            </TabsList>

            {/* 时间戳转日期 */}
            <TabsContent value="to-date" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timestamp">Unix 时间戳（秒）</Label>
                <Input
                  id="timestamp"
                  type="number"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  placeholder="1638360000"
                />
              </div>
              <Button onClick={handleTimestampToDate} className="w-full">
                转换为日期
              </Button>
              {dateString && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="font-mono text-lg">{dateString}</div>
                </div>
              )}
            </TabsContent>

            {/* 日期转时间戳 */}
            <TabsContent value="to-timestamp" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">日期时间</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={dateString}
                  onChange={(e) => setDateString(e.target.value)}
                />
              </div>
              <Button onClick={handleDateToTimestamp} className="w-full">
                转换为时间戳
              </Button>
              {timestamp && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="font-mono text-lg">{timestamp}</div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
```

### 4. utils.ts

```typescript
/**
 * 格式化时间戳为可读日期
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * 解析日期字符串为时间戳
 */
export function parseDate(dateString: string): number {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }
  return Math.floor(date.getTime() / 1000);
}

/**
 * 获取当前时间戳
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}
```

---

## 后端 API 开发（FastAPI）

如果你的工具需要后端支持，在 `backend/app/routers/` 创建对应的路由。

### 示例：IP 查询 API

```python
# backend/app/routers/ip_lookup.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests

router = APIRouter(prefix="/api/ip", tags=["ip"])

class IPRequest(BaseModel):
    ip: str

class IPResponse(BaseModel):
    success: bool
    data: dict | None = None
    error: str | None = None

@router.post("/lookup", response_model=IPResponse)
async def lookup_ip(request: IPRequest):
    try:
        # 调用第三方 IP 查询 API
        response = requests.get(f"http://ip-api.com/json/{request.ip}")
        data = response.json()

        if data['status'] == 'success':
            return IPResponse(
                success=True,
                data={
                    "ip": data['query'],
                    "country": data['country'],
                    "city": data['city'],
                    "isp": data['isp']
                }
            )
        else:
            return IPResponse(
                success=False,
                error="Invalid IP address"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 测试清单

开发完成后，请确保：

- [ ] 工具在不同屏幕尺寸下正常显示（响应式）
- [ ] 输入验证完善，有友好的错误提示
- [ ] 所有按钮和交互正常工作
- [ ] 复制、清空等常用功能已实现
- [ ] 代码符合开发规范
- [ ] 已添加到工具注册表
- [ ] 提交信息符合规范

---

## 常见工具类型参考

### 文本处理类
- Base64 编码/解码
- URL 编码/解码
- Markdown 预览
- 文本差异对比

### 格式转换类
- JSON ↔ YAML
- CSV ↔ JSON
- 颜色格式转换（HEX、RGB、HSL）

### 网络工具类
- IP 地址查询
- User Agent 解析
- URL 解析器

### 开发工具类
- JWT 解析
- 正则表达式测试
- Cron 表达式生成器

### 加密工具类
- MD5/SHA 哈希
- 密码生成器
- AES 加密/解密

---

## 获取帮助

- 查看现有工具代码作为参考
- 阅读 `docs/DEVELOPMENT.md` 了解开发规范
- 遇到问题提交 Issue

Happy Coding!
