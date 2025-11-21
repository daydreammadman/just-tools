# Just Tools - 项目架构设计文档

## 项目概述

Just Tools 是一个集合各种实用小工具的 Web 应用，旨在为用户提供快速、便捷的在线工具服务。

### 技术栈

- **前端**: React 19 + TypeScript + Vite
- **UI 框架**: shadcn/ui + Tailwind CSS
- **后端**: FastAPI (Python)
- **状态管理**: React Hooks (Context API)
- **路由**: React Router
- **图标**: Lucide React

---

## 项目目录结构

```
just-tools/
├── src/
│   ├── assets/                 # 静态资源
│   ├── components/             # 组件目录
│   │   ├── ui/                 # shadcn/ui 组件
│   │   ├── layout/             # 布局组件
│   │   │   ├── Header.tsx      # 头部导航
│   │   │   ├── Sidebar.tsx     # 侧边栏
│   │   │   └── Footer.tsx      # 页脚
│   │   └── common/             # 通用组件
│   │       ├── ToolCard.tsx    # 工具卡片
│   │       └── SearchBar.tsx   # 搜索栏
│   ├── tools/                  # 工具模块目录
│   │   ├── index.ts            # 工具注册中心
│   │   ├── types.ts            # 工具类型定义
│   │   ├── ip-lookup/          # IP地址查询工具
│   │   │   ├── index.tsx       # 工具主组件
│   │   │   ├── config.ts       # 工具配置
│   │   │   └── utils.ts        # 工具辅助函数
│   │   ├── json-formatter/     # JSON美化工具
│   │   │   ├── index.tsx
│   │   │   ├── config.ts
│   │   │   └── utils.ts
│   │   └── timestamp-converter/ # 时间戳转换工具
│   │       ├── index.tsx
│   │       ├── config.ts
│   │       └── utils.ts
│   ├── pages/                  # 页面组件
│   │   ├── Home.tsx            # 首页（工具列表）
│   │   ├── ToolPage.tsx        # 工具详情页
│   │   └── NotFound.tsx        # 404页面
│   ├── hooks/                  # 自定义Hooks
│   │   ├── useTools.ts         # 工具管理Hook
│   │   ├── useSearch.ts        # 搜索功能Hook
│   │   └── useClipboard.ts     # 剪贴板Hook
│   ├── context/                # Context状态管理
│   │   └── ToolContext.tsx     # 工具全局状态
│   ├── services/               # 服务层（API调用）
│   │   ├── api.ts              # API基础配置
│   │   └── toolsAPI.ts         # 工具相关API
│   ├── utils/                  # 工具函数
│   │   ├── constants.ts        # 常量定义
│   │   └── helpers.ts          # 辅助函数
│   ├── types/                  # TypeScript类型定义
│   │   ├── tool.ts             # 工具类型
│   │   └── api.ts              # API类型
│   ├── lib/                    # 第三方库配置
│   │   └── utils.ts            # shadcn/ui工具函数
│   ├── App.tsx                 # 根组件
│   ├── main.tsx                # 入口文件
│   └── index.css               # 全局样式
├── backend/                    # FastAPI后端（待创建）
│   ├── app/
│   │   ├── main.py             # FastAPI应用入口
│   │   ├── config.py           # 配置文件
│   │   ├── routers/            # 路由
│   │   │   └── tools.py        # 工具路由
│   │   ├── services/           # 业务逻辑
│   │   │   ├── ip_service.py   # IP查询服务
│   │   │   └── ...
│   │   ├── models/             # 数据模型
│   │   └── utils/              # 工具函数
│   ├── requirements.txt        # Python依赖
│   └── .env                    # 环境变量
├── public/                     # 静态资源
├── docs/                       # 文档目录
│   ├── ARCHITECTURE.md         # 架构文档
│   ├── DEVELOPMENT.md          # 开发规范
│   ├── TOOL_GUIDE.md           # 工具开发指南
│   └── API.md                  # API文档
└── package.json
```

---

## 核心架构设计

### 1. 工具注册系统

每个工具都是一个独立的模块，通过统一的配置文件注册到系统中。

#### 工具配置接口

```typescript
interface ToolConfig {
  id: string;                    // 唯一标识符
  name: string;                  // 工具名称
  description: string;           // 工具描述
  category: ToolCategory;        // 工具分类
  icon: LucideIcon;             // 工具图标
  tags: string[];               // 搜索标签
  component: React.ComponentType; // 工具组件
  requiresBackend: boolean;     // 是否需要后端支持
  version: string;              // 版本号
}
```

#### 工具分类

```typescript
enum ToolCategory {
  TEXT = 'text',              // 文本处理
  NETWORK = 'network',        // 网络工具
  CONVERSION = 'conversion',  // 格式转换
  CRYPTO = 'crypto',          // 加密解密
  DEVELOPMENT = 'development',// 开发工具
  UTILITIES = 'utilities'     // 实用工具
}
```

### 2. 组件层级

```
App
├── Header (全局导航)
├── Sidebar (分类导航)
└── Routes
    ├── Home (工具列表)
    │   └── ToolCard[] (工具卡片)
    └── ToolPage (工具详情)
        └── ToolComponent (具体工具)
```

### 3. 数据流

```
用户操作 → 工具组件 → (可选) API服务 → 后端处理 → 返回结果 → 更新UI
```

### 4. 工具开发模式

#### 纯前端工具
- 所有逻辑在浏览器中完成
- 无需后端支持
- 示例：JSON格式化、Base64编码

#### 前后端协作工具
- 前端负责UI交互
- 后端负责复杂计算或外部API调用
- 示例：IP地址查询、图片压缩

---

## 状态管理策略

### Context API 使用场景

1. **全局主题设置**
2. **工具收藏列表**
3. **搜索历史**
4. **用户偏好设置**

### 本地 State 使用场景

1. **表单输入**
2. **工具内部状态**
3. **临时数据**

---

## API 设计原则

### RESTful API 规范

```
GET    /api/tools              # 获取所有工具列表
GET    /api/tools/:id          # 获取工具详情
POST   /api/tools/:id/execute  # 执行工具操作
```

### 工具特定API

```
POST   /api/ip/lookup          # IP地址查询
POST   /api/image/compress     # 图片压缩
POST   /api/qr/generate        # 二维码生成
```

### 响应格式

```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: number;
}
```

---

## 性能优化策略

### 1. 代码分割
- 按工具模块懒加载
- React.lazy + Suspense

### 2. 缓存策略
- 工具结果缓存（sessionStorage）
- API响应缓存（SWR/React Query）

### 3. 构建优化
- Tree Shaking
- 压缩和混淆
- CDN部署

---

## 安全考虑

### 前端安全
1. XSS防护：输入输出转义
2. CSRF防护：Token验证
3. 敏感数据不存储在浏览器

### 后端安全
1. 请求频率限制
2. 输入验证和清理
3. API密钥保护
4. CORS配置

---

## 扩展性设计

### 插件化架构
- 工具作为插件动态加载
- 统一的工具接口
- 便于第三方工具接入

### 国际化支持
- i18n框架集成
- 多语言工具描述
- 本地化数字/日期格式

### 主题系统
- 亮色/暗色主题
- 自定义主题色
- CSS变量驱动

---

## 部署架构

### 开发环境
```
Frontend: Vite Dev Server (5173)
Backend:  FastAPI Uvicorn (8000)
```

### 生产环境
```
Frontend: Vercel / Netlify / GitHub Pages
Backend:  Docker + AWS / Railway / Render
CDN:      Cloudflare
```

---

## 监控和日志

### 前端监控
- 错误追踪（Sentry）
- 性能监控（Web Vitals）
- 用户行为分析（Google Analytics）

### 后端监控
- API响应时间
- 错误日志
- 资源使用情况

---

## 版本控制策略

### 分支管理
- `main`: 生产环境
- `develop`: 开发环境
- `feature/*`: 新功能
- `tool/*`: 新工具开发

### 提交规范
```
feat: 新增功能
fix: 修复问题
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具配置
```

---

## 未来规划

### Phase 1（当前）
- 基础架构搭建
- 3-5个核心工具实现
- 基本UI/UX完成

### Phase 2
- 10+工具覆盖
- 用户系统（收藏、历史）
- PWA支持

### Phase 3
- 工具市场（第三方工具）
- API开放平台
- 浏览器插件

---

## 参考资源

- [React 官方文档](https://react.dev)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [FastAPI 文档](https://fastapi.tiangolo.com)
- [Tailwind CSS 文档](https://tailwindcss.com)
