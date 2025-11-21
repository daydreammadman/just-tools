# Just Tools - 开发规范文档

## 代码规范

### 1. TypeScript 规范

#### 类型定义

```typescript
// ✅ 使用 interface 定义对象类型
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ 使用 type 定义联合类型、交叉类型
type Status = 'idle' | 'loading' | 'success' | 'error';
type Response = SuccessResponse | ErrorResponse;

// ✅ 明确函数返回类型
function formatDate(date: Date): string {
  return date.toISOString();
}

// ❌ 避免使用 any
const data: any = {}; // 不推荐

// ✅ 使用 unknown 或具体类型
const data: unknown = {};
```

#### 命名规范

```typescript
// 接口：PascalCase，使用描述性名称
interface ToolConfig {}
interface APIResponse {}

// 类型别名：PascalCase
type ToolCategory = string;

// 枚举：PascalCase，成员使用UPPER_SNAKE_CASE
enum HttpStatus {
  OK = 200,
  NOT_FOUND = 404,
  SERVER_ERROR = 500
}

// 常量：UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 1024 * 1024;
const API_BASE_URL = 'https://api.example.com';

// 变量和函数：camelCase
const toolList = [];
function processData() {}

// 组件：PascalCase
function ToolCard() {}
function IPLookup() {}

// 私有方法/变量：前缀 _
class Service {
  private _internalState = 0;
  private _processInternal() {}
}
```

#### 严格模式配置

```json
// tsconfig.json 必须启用
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

### 2. React 组件规范

#### 组件结构

```tsx
// 标准组件结构
import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { ToolProps } from './types';

interface ComponentProps {
  title: string;
  onSubmit?: (value: string) => void;
}

/**
 * 组件功能描述
 * @param props - 组件属性
 */
export const Component: FC<ComponentProps> = ({ title, onSubmit }) => {
  // 1. Hooks
  const [state, setState] = useState('');

  useEffect(() => {
    // 副作用逻辑
  }, []);

  // 2. 事件处理函数
  const handleSubmit = () => {
    onSubmit?.(state);
  };

  // 3. 渲染辅助函数
  const renderContent = () => {
    return <div>{state}</div>;
  };

  // 4. 返回 JSX
  return (
    <div className="container">
      <h1>{title}</h1>
      {renderContent()}
      <Button onClick={handleSubmit}>提交</Button>
    </div>
  );
};
```

#### 组件命名

```tsx
// ✅ 文件名与组件名一致
// ToolCard.tsx
export const ToolCard = () => {};

// ✅ 使用 index.tsx 导出主组件
// tools/ip-lookup/index.tsx
export { IPLookup } from './IPLookup';

// ✅ 使用 FC 类型
const Component: FC<Props> = () => {};

// ❌ 避免默认导出（除了 index.tsx）
export default Component; // 不推荐
```

#### Hooks 使用规范

```tsx
// ✅ 自定义 Hook 以 use 开头
function useTools() {
  const [tools, setTools] = useState([]);
  return { tools, setTools };
}

// ✅ Hook 依赖项明确
useEffect(() => {
  fetchData(id);
}, [id]); // 明确依赖

// ❌ 避免在循环/条件中使用 Hooks
if (condition) {
  useState(); // ❌ 错误
}

// ✅ 使用 useCallback 优化函数
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

---

### 3. 样式规范

#### Tailwind CSS 使用

```tsx
// ✅ 使用 Tailwind 类名（结合主题变量）
<div className="flex items-center gap-4 p-6 rounded-lg bg-card text-card-foreground shadow-md">
  <span className="text-lg font-semibold text-foreground">Title</span>
</div>

// ✅ 使用 cn 工具合并类名
import { cn } from '@/lib/utils';

<div className={cn(
  "base-class",
  isActive && "active-class",
  className // 外部传入的类名
)} />

// ✅ 响应式设计
<div className="w-full md:w-1/2 lg:w-1/3">
  Content
</div>

// ❌ 避免内联样式（特殊情况除外）
<div style={{ color: 'red' }}> // 不推荐
```

#### 主题变量

```css
/* 使用 CSS 变量 */
:root {
  --primary: #3b82f6;
  --secondary: #64748b;
  --background: #ffffff;
  --foreground: #0f172a;
}

.dark {
  --background: #0f172a;
  --foreground: #f8fafc;
}
```

---

### 4. 文件组织规范

#### 导入顺序

```tsx
// 1. React 相关
import { FC, useState, useEffect } from 'react';

// 2. 第三方库
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

// 3. 内部组件
import { Button } from '@/components/ui/button';
import { ToolCard } from '@/components/common/ToolCard';

// 4. Hooks
import { useTools } from '@/hooks/useTools';

// 5. 工具函数
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/helpers';

// 6. 类型
import type { Tool, ToolConfig } from '@/types/tool';

// 7. 样式
import './styles.css';
```

#### 文件命名

```
组件文件：PascalCase.tsx        (ToolCard.tsx)
工具文件：camelCase.ts          (helpers.ts)
类型文件：camelCase.ts          (tool.ts)
常量文件：camelCase.ts          (constants.ts)
样式文件：kebab-case.css        (tool-card.css)
测试文件：*.test.tsx / *.spec.tsx
```

---

### 5. Git 提交规范

#### Commit Message 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type 类型

```
feat:     新功能
fix:      修复 Bug
docs:     文档更新
style:    代码格式调整（不影响功能）
refactor: 重构（不是新增功能，也不是修复Bug）
perf:     性能优化
test:     测试相关
chore:    构建/工具配置
tool:     新增工具
```

#### 示例

```bash
# 新增功能
feat(tools): add JSON formatter tool

# 修复问题
fix(ip-lookup): correct IP validation regex

# 文档更新
docs(readme): update installation instructions

# 新增工具
tool(timestamp): add timestamp converter

# 重构
refactor(tool-card): simplify rendering logic
```

---

### 6. 注释规范

#### JSDoc 注释

```typescript
/**
 * 格式化时间戳为可读日期
 * @param timestamp - Unix 时间戳（秒）
 * @param format - 日期格式，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 * @example
 * formatTimestamp(1638360000) // '2021-12-01 12:00:00'
 */
export function formatTimestamp(
  timestamp: number,
  format = 'YYYY-MM-DD HH:mm:ss'
): string {
  // 实现
}
```

#### 组件注释

```tsx
/**
 * 工具卡片组件
 *
 * 显示工具的基本信息，包括图标、名称、描述和标签
 *
 * @component
 * @example
 * <ToolCard
 *   tool={toolConfig}
 *   onClick={() => navigate(`/tools/${tool.id}`)}
 * />
 */
export const ToolCard: FC<ToolCardProps> = ({ tool, onClick }) => {
  // 实现
};
```

#### 行内注释

```typescript
// ✅ 解释"为什么"，而不是"是什么"
// 使用 debounce 避免频繁 API 调用
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  []
);

// ❌ 不要注释显而易见的内容
// 设置 count 为 0
setCount(0);
```

---

### 7. 错误处理规范

#### Try-Catch 使用

```typescript
// ✅ 具体的错误处理
try {
  const data = await fetchData();
  return processData(data);
} catch (error) {
  if (error instanceof NetworkError) {
    toast.error('网络连接失败，请检查网络设置');
  } else if (error instanceof ValidationError) {
    toast.error('输入数据格式错误');
  } else {
    console.error('Unexpected error:', error);
    toast.error('操作失败，请稍后重试');
  }
}

// ✅ API 调用错误处理
async function fetchToolData(id: string): Promise<Tool> {
  try {
    const response = await fetch(`/api/tools/${id}`);

    if (!response.ok) {
      throw new APIError(`HTTP ${response.status}`, response.status);
    }

    return await response.json();
  } catch (error) {
    // 记录错误用于调试
    logError('fetchToolData', error);
    throw error;
  }
}
```

#### 错误边界

```tsx
// ErrorBoundary 组件
class ErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误
    logError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

// 使用
<ErrorBoundary>
  <ToolComponent />
</ErrorBoundary>
```

---

### 8. 性能优化规范

#### React 性能优化

```tsx
// ✅ 使用 memo 避免不必要的重渲染
export const ToolCard = memo<ToolCardProps>(({ tool }) => {
  return <div>{tool.name}</div>;
});

// ✅ 使用 useMemo 缓存计算结果
const filteredTools = useMemo(() => {
  return tools.filter(tool =>
    tool.name.includes(searchQuery)
  );
}, [tools, searchQuery]);

// ✅ 使用 lazy 懒加载组件
const IPLookup = lazy(() => import('@/tools/ip-lookup'));

// 使用 Suspense
<Suspense fallback={<Loading />}>
  <IPLookup />
</Suspense>
```

#### 代码分割

```tsx
// 按路由分割
const Home = lazy(() => import('@/pages/Home'));
const ToolPage = lazy(() => import('@/pages/ToolPage'));

// 按工具分割
const tools = {
  'ip-lookup': lazy(() => import('@/tools/ip-lookup')),
  'json-formatter': lazy(() => import('@/tools/json-formatter')),
};
```

---

### 9. 测试规范

#### 单元测试

```typescript
// tool.test.ts
import { describe, it, expect } from 'vitest';
import { formatTimestamp } from './utils';

describe('formatTimestamp', () => {
  it('should format Unix timestamp correctly', () => {
    const result = formatTimestamp(1638360000);
    expect(result).toBe('2021-12-01 12:00:00');
  });

  it('should handle invalid input', () => {
    expect(() => formatTimestamp(-1)).toThrow();
  });
});
```

#### 组件测试

```tsx
// ToolCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolCard } from './ToolCard';

describe('ToolCard', () => {
  const mockTool = {
    id: 'test',
    name: 'Test Tool',
    description: 'A test tool'
  };

  it('should render tool information', () => {
    render(<ToolCard tool={mockTool} />);
    expect(screen.getByText('Test Tool')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ToolCard tool={mockTool} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

---

### 10. 代码审查清单

开发完成后，自查以下内容：

- [ ] 代码符合 TypeScript 规范
- [ ] 没有 `any` 类型（特殊情况除外）
- [ ] 所有函数都有返回类型标注
- [ ] 组件拆分合理，单一职责
- [ ] 使用了合适的 Hooks（memo、useMemo、useCallback）
- [ ] 错误处理完善
- [ ] 添加了必要的注释
- [ ] 没有 console.log（开发调试除外）
- [ ] 代码格式化（Prettier）
- [ ] 通过 ESLint 检查
- [ ] 提交信息符合规范
- [ ] 更新了相关文档

---

## 工具链配置

### ESLint 配置

```javascript
// eslint.config.js
export default [
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    }
  }
];
```

### Prettier 配置

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
```

### VS Code 配置

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## 开发流程

### 1. 开发新工具

```bash
# 创建分支
git checkout -b tool/tool-name

# 开发 → 测试 → 提交
npm run dev
npm run test
git add .
git commit -m "tool(tool-name): add new tool"

# 推送并创建 PR
git push origin tool/tool-name
```

### 2. 代码审查

- 至少一位团队成员审查
- 确保通过所有 CI 检查
- 代码符合规范
- 功能正常工作

### 3. 合并发布

```bash
# 合并到 develop
git checkout develop
git merge tool/tool-name

# 发布到生产
git checkout main
git merge develop
git tag v1.x.x
git push --tags
```

---

## 常见问题

### Q: 何时使用 `unknown` 而不是 `any`？

A: 当你不确定类型时，优先使用 `unknown`，它需要类型检查后才能使用。

### Q: 什么时候需要使用 `useCallback`？

A: 当函数作为 props 传递给子组件，且子组件使用了 `memo` 优化时。

### Q: 如何处理异步错误？

A: 使用 try-catch 包裹 async 函数，并提供用户友好的错误提示。

---

## 学习资源

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [Conventional Commits](https://www.conventionalcommits.org/)
