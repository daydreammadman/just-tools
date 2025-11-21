# AI 工具开发助手 - 提示词文档

本文档是专为 AI 助手设计的开发指南，用于帮助 AI 理解项目规范并正确开发工具。

---

## 项目背景

你正在协助开发 **Just Tools** 项目，这是一个集合各种实用小工具的 Web 应用。

### 技术栈
- **前端**: React 19 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **图标**: Lucide React
- **后端**: FastAPI (Python)

### 项目目录结构

```
src/
├── tools/                  # 工具模块目录
│   ├── index.ts           # 工具注册中心
│   ├── types.ts           # 工具类型定义
│   └── [tool-name]/       # 具体工具目录
│       ├── index.tsx      # 工具主组件
│       ├── config.ts      # 工具配置
│       └── utils.ts       # 工具函数
├── components/
│   └── ui/                # shadcn/ui 组件
├── hooks/                 # 自定义 Hooks
├── lib/
│   └── utils.ts           # cn() 工具函数
└── types/                 # 类型定义
```

---

## 开发工具时的核心规则

### ⚠️ 关键约束

1. **禁止硬编码样式**
   - ❌ 不要使用内联 style 属性
   - ❌ 不要写死颜色值（如 `#3b82f6`、`rgb(59, 130, 246)`）
   - ❌ 不要写死尺寸（如 `width: 300px`）
   - ✅ 必须使用 Tailwind CSS 类名
   - ✅ 使用语义化的颜色类（如 `bg-primary`、`text-muted-foreground`）
   - ✅ 使用响应式类（如 `w-full md:w-1/2`）

2. **必须使用 shadcn/ui 组件**
   - 使用 `Button`、`Input`、`Card`、`Label` 等 shadcn/ui 组件
   - 不要创建自定义的基础 UI 组件

3. **TypeScript 严格模式**
   - 所有函数必须有返回类型标注
   - 禁止使用 `any` 类型
   - Props 必须定义接口

4. **工具必须独立**
   - 每个工具是独立的模块
   - 通过配置文件注册到系统
   - 不直接修改其他工具代码

---

## 工具开发标准流程

当用户要求开发新工具时，按以下步骤进行：

### 步骤 1: 确认需求

询问或确认以下信息：
- 工具的功能描述
- 工具名称（中文和英文 ID）
- 工具分类（text/network/conversion/crypto/development/utilities）
- 是否需要后端支持
- 输入输出格式

### 步骤 2: 创建工具目录结构

```bash
src/tools/[tool-id]/
├── index.tsx           # 工具主组件（必需）
├── config.ts           # 工具配置（必需）
├── utils.ts            # 工具辅助函数（可选）
├── types.ts            # 类型定义（可选）
├── components/         # 子组件（可选）
│   └── SubComponent.tsx
└── README.md           # 工具说明（推荐）
```

### 步骤 3: 创建类型定义文件 (src/tools/types.ts)

**首次创建时需要创建此文件（已经创建了，不需要再重复创建）：**

```typescript
import type { LucideProps } from 'lucide-react';
import { FC } from 'react';

export type ToolCategory =
  | 'text'          // 文本处理
  | 'network'       // 网络工具
  | 'crypto'        // 加密解密
  | 'development'   // 开发运维
  | 'media'         // 图片媒体
  | 'conversion'    // 单位换算
  | 'utilities';    // 日常工具

export interface ToolConfig {
  id: string;                    // 唯一标识符，kebab-case
  name: string;                  // 工具中文名称
  description: string;           // 工具描述
  category: ToolCategory;        // 工具分类
  icon: FC<LucideProps>;         // Lucide 图标组件
  tags: string[];               // 搜索标签
  component: FC;                // 工具组件
  requiresBackend: boolean;     // 是否需要后端
  version: string;              // 版本号
}
```

### 步骤 4: 创建工具配置 (config.ts)

```typescript
import { ToolConfig } from '@/tools/types';
import { IconName } from 'lucide-react'; // 选择合适的图标
import { ComponentName } from './index';

export const toolConfig: ToolConfig = {
  id: 'tool-id',              // kebab-case
  name: '工具中文名',
  description: '简短的功能描述',
  category: 'conversion',      // 选择合适的分类
  icon: IconName,              // Lucide 图标
  tags: ['标签1', 'tag2'],    // 中英文搜索标签
  component: ComponentName,
  requiresBackend: false,      // true 需要后端
  version: '1.0.0',
};
```

### 步骤 5: 创建工具组件 (index.tsx)

**必须遵循的组件模板：**

```tsx
import { FC, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ToolNameProps {
  // 外部传入的 props（如果有）
}

export const ToolName: FC<ToolNameProps> = () => {
  // 1. State 定义
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2. 事件处理函数
  const handleProcess = () => {
    try {
      setIsLoading(true);

      // 输入验证
      if (!input.trim()) {
        toast.error('请输入内容');
        return;
      }

      // 处理逻辑（调用 utils.ts 中的函数）
      const result = processData(input);
      setOutput(result);

      toast.success('处理成功');
    } catch (error) {
      console.error('Process error:', error);
      toast.error('处理失败，请检查输入');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  // 3. 渲染
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>工具标题</CardTitle>
          <CardDescription>
            工具描述和使用说明
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 输入区域 */}
          <div className="space-y-2">
            <Label htmlFor="input">输入标签</Label>
            <Textarea
              id="input"
              placeholder="请输入..."
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
              <Label htmlFor="output">输出</Label>
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

### 步骤 6: 创建工具函数 (utils.ts)

```typescript
/**
 * 工具核心处理函数
 * @param input - 输入数据
 * @returns 处理后的结果
 * @throws {Error} 输入无效时抛出错误
 */
export function processData(input: string): string {
  // 输入验证
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input');
  }

  // 处理逻辑
  const result = input.trim();

  return result;
}

/**
 * 验证输入
 * @param input - 待验证数据
 * @returns 是否有效
 */
export function validateInput(input: string): boolean {
  return input.length > 0;
}
```

### 步骤 7: 注册工具到系统

**在 `src/tools/index.ts` 中：**

```typescript
import { ToolConfig } from './types';
import { toolConfig as newTool } from './new-tool/config';
// ... 导入其他工具

// 工具注册表
export const allTools: ToolConfig[] = [
  // ... 其他工具
  newTool,  // 添加新工具
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

---

## 样式规范（极其重要）

### ✅ 正确的样式写法

```tsx
// 使用 Tailwind 类名
<div className="flex items-center gap-4 p-6 rounded-lg bg-card shadow-md">
  <span className="text-lg font-semibold text-foreground">Title</span>
</div>

// 响应式设计
<div className="w-full md:w-1/2 lg:w-1/3 p-4 md:p-6">
  Content
</div>

// 使用语义化颜色
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Submit
</Button>

// 条件类名（使用 cn 工具）
import { cn } from '@/lib/utils';

<div className={cn(
  "base-class p-4",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 cursor-not-allowed"
)} />
```

### ❌ 禁止的样式写法

```tsx
// ❌ 禁止内联样式
<div style={{ color: 'red', padding: '20px' }}>

// ❌ 禁止硬编码颜色
<div className="bg-[#3b82f6]">
<div style={{ backgroundColor: 'rgb(59, 130, 246)' }}>

// ❌ 禁止写死尺寸
<div style={{ width: '300px', height: '200px' }}>
```

### 常用的 Tailwind 类名参考

#### 颜色
```
bg-background          # 背景色
text-foreground        # 前景色/文字色
bg-primary             # 主色
text-primary-foreground # 主色文字
bg-secondary           # 次要色
bg-muted               # 柔和背景
text-muted-foreground  # 柔和文字
bg-destructive         # 危险/错误色
border-border          # 边框色
```

#### 间距
```
p-4, p-6, p-8         # padding
m-4, m-6, m-8         # margin
gap-2, gap-4, gap-6   # flex/grid gap
space-y-4, space-x-4  # children 间距
```

#### 布局
```
flex, grid            # 布局方式
items-center          # 垂直居中
justify-between       # 水平分散
w-full                # 宽度 100%
max-w-4xl             # 最大宽度
container mx-auto     # 居中容器
```

#### 响应式
```
sm:   640px+
md:   768px+
lg:   1024px+
xl:   1280px+
2xl:  1536px+

示例: w-full md:w-1/2 lg:w-1/3
```

---

## 常用 shadcn/ui 组件

### Button
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

### Input / Textarea
```tsx
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="input">Label</Label>
  <Input
    id="input"
    type="text"
    placeholder="Placeholder"
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
</div>

<Textarea
  rows={6}
  className="font-mono"  // 等宽字体适合代码
/>
```

### Card
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

### Tabs
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    Content 1
  </TabsContent>
  <TabsContent value="tab2">
    Content 2
  </TabsContent>
</Tabs>
```

### Toast 通知
```tsx
import { toast } from 'sonner';

toast.success('操作成功');
toast.error('操作失败');
toast.info('提示信息');
toast.warning('警告信息');
```

---

## TypeScript 规范

### 类型定义
```typescript
// Props 接口
interface ComponentProps {
  title: string;
  count?: number;  // 可选
  onSubmit: (value: string) => void;
}

// 函数返回类型
function formatData(input: string): string {
  return input.toUpperCase();
}

// 异步函数
async function fetchData(id: string): Promise<Data> {
  const response = await fetch(`/api/${id}`);
  return response.json();
}

// 联合类型
type Status = 'idle' | 'loading' | 'success' | 'error';

// 泛型
function identity<T>(value: T): T {
  return value;
}
```

### 禁止的写法
```typescript
// ❌ 禁止 any
const data: any = {};

// ✅ 使用 unknown 或具体类型
const data: unknown = {};
const data: { [key: string]: string } = {};

// ❌ 禁止省略返回类型（除非显而易见）
function process(input: string) {  // 缺少返回类型
  return input.toUpperCase();
}

// ✅ 明确返回类型
function process(input: string): string {
  return input.toUpperCase();
}
```

---

## 错误处理规范

```typescript
// ✅ 具体的错误处理
try {
  const result = await processData(input);
  toast.success('处理成功');
  return result;
} catch (error) {
  console.error('Process error:', error);

  // 用户友好的错误提示
  if (error instanceof ValidationError) {
    toast.error('输入格式不正确');
  } else if (error instanceof NetworkError) {
    toast.error('网络请求失败');
  } else {
    toast.error('处理失败，请稍后重试');
  }
}
```

---

## 命名规范

```typescript
// 组件：PascalCase
const ToolCard = () => {};
const IPLookup = () => {};

// 函数和变量：camelCase
const handleSubmit = () => {};
const toolList = [];

// 常量：UPPER_SNAKE_CASE
const MAX_LENGTH = 1000;
const API_BASE_URL = 'https://api.example.com';

// 类型和接口：PascalCase
interface ToolConfig {}
type ToolCategory = string;

// 文件名
// 组件：PascalCase.tsx (ToolCard.tsx)
// 工具：camelCase.ts (helpers.ts)
// 工具目录：kebab-case (ip-lookup/)
```

---

## 开发工具时的检查清单

开发完成后，确保：

- [ ] 没有使用内联样式 (`style={{}}`)
- [ ] 没有硬编码颜色值
- [ ] 使用了 shadcn/ui 组件
- [ ] 使用了 Tailwind CSS 类名
- [ ] 响应式设计（使用 `md:`、`lg:` 等前缀）
- [ ] 所有函数都有返回类型
- [ ] 没有使用 `any` 类型
- [ ] Props 定义了接口
- [ ] 有输入验证
- [ ] 有错误处理
- [ ] 有用户友好的错误提示（toast）
- [ ] 有清空/重置功能
- [ ] 代码有必要的注释
- [ ] 组件导出正确
- [ ] 工具已注册到 `src/tools/index.ts`

---

## 工具示例参考

### 示例 1: 简单文本转换工具

```typescript
// config.ts
import { ToolConfig } from '@/tools/types';
import { Type } from 'lucide-react';
import { CaseConverter } from './index';

export const toolConfig: ToolConfig = {
  id: 'case-converter',
  name: '大小写转换',
  description: '转换文本的大小写格式',
  category: 'text',
  icon: Type,
  tags: ['大小写', 'case', '文本', 'text'],
  component: CaseConverter,
  requiresBackend: false,
  version: '1.0.0',
};
```

```typescript
// utils.ts
export function toUpperCase(text: string): string {
  return text.toUpperCase();
}

export function toLowerCase(text: string): string {
  return text.toLowerCase();
}

export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
```

```tsx
// index.tsx
import { FC, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { toUpperCase, toLowerCase, toTitleCase } from './utils';

export const CaseConverter: FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleConvert = (converter: (text: string) => string) => {
    if (!input.trim()) {
      toast.error('请输入文本');
      return;
    }
    const result = converter(input);
    setOutput(result);
    toast.success('转换成功');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>大小写转换</CardTitle>
          <CardDescription>
            快速转换文本的大小写格式
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input">输入文本</Label>
            <Textarea
              id="input"
              placeholder="请输入文本..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleConvert(toUpperCase)}>
              全部大写
            </Button>
            <Button onClick={() => handleConvert(toLowerCase)} variant="secondary">
              全部小写
            </Button>
            <Button onClick={() => handleConvert(toTitleCase)} variant="outline">
              标题格式
            </Button>
          </div>

          {output && (
            <div className="space-y-2">
              <Label htmlFor="output">输出</Label>
              <Textarea
                id="output"
                value={output}
                readOnly
                rows={6}
                className="bg-muted"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## 常见问题处理

### Q: 工具需要多个输入字段怎么办？

A: 使用多个 Input/Textarea 组件，配合 Label：

```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="field1">字段 1</Label>
    <Input id="field1" value={field1} onChange={(e) => setField1(e.target.value)} />
  </div>
  <div className="space-y-2">
    <Label htmlFor="field2">字段 2</Label>
    <Input id="field2" value={field2} onChange={(e) => setField2(e.target.value)} />
  </div>
</div>
```

### Q: 工具需要选项配置怎么办？

A: 使用 Tabs、Select 或 Checkbox：

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="option1" onValueChange={(v) => setOption(v)}>
  <TabsList>
    <TabsTrigger value="option1">选项 1</TabsTrigger>
    <TabsTrigger value="option2">选项 2</TabsTrigger>
  </TabsList>
  <TabsContent value="option1">...</TabsContent>
  <TabsContent value="option2">...</TabsContent>
</Tabs>
```

### Q: 如何实现复制功能？

A: 使用浏览器 Clipboard API：

```tsx
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(output);
    toast.success('已复制到剪贴板');
  } catch (error) {
    toast.error('复制失败');
  }
};

<Button onClick={handleCopy} variant="ghost" size="sm">
  复制
</Button>
```

### Q: 工具需要实时预览怎么办？

A: 使用 `useEffect` 监听输入变化：

```tsx
import { useEffect } from 'react';

useEffect(() => {
  if (input) {
    const result = processData(input);
    setOutput(result);
  }
}, [input]);
```

---

## 开始开发

当用户提出开发工具的需求时：

1. **理解需求**：确认工具功能、输入输出
2. **创建文件**：按照标准结构创建 `config.ts`、`index.tsx`、`utils.ts`
3. **编写代码**：严格遵循本文档的规范和模板
4. **注册工具**：添加到 `src/tools/index.ts`
5. **测试提醒**：提醒用户测试工具功能

记住：**绝对不要硬编码样式，必须使用 Tailwind CSS 和 shadcn/ui 组件！**

---

## 你的任务

当收到用户的工具开发需求时，你应该：

1. 分析需求，确认工具类型和功能
2. 按照本文档的模板创建完整的工具代码
3. 确保代码符合所有规范（特别是样式规范）
4. 提供清晰的文件创建说明
5. 提醒用户如何测试和使用

现在，你已经准备好协助开发 Just Tools 的工具了！
