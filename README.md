# Just Tools

一个集合各种实用小工具的 Web 应用平台，提供快速、便捷的在线工具服务。

## 项目简介

Just Tools 是一个现代化的工具集合平台，旨在为开发者和日常用户提供常用的在线工具，包括但不限于：

- IP 地址查询
- JSON 格式化
- 时间戳转换
- Base64 编码/解码
- 文本处理工具
- 更多工具持续添加中...

## 技术栈

### 前端
- **框架**: React 19
- **语言**: TypeScript
- **构建工具**: Vite
- **UI 框架**: shadcn/ui
- **样式**: Tailwind CSS
- **图标**: Lucide React

### 后端
- **框架**: FastAPI (Python)
- **API 文档**: Swagger/OpenAPI

## 项目结构

```
just-tools/
├── src/                    # 前端源代码
│   ├── components/         # React 组件
│   ├── tools/              # 工具模块
│   ├── pages/              # 页面组件
│   ├── hooks/              # 自定义 Hooks
│   ├── services/           # API 服务
│   └── utils/              # 工具函数
├── backend/                # 后端源代码（待创建）
│   └── app/                # FastAPI 应用
├── docs/                   # 项目文档
│   ├── ARCHITECTURE.md     # 架构设计文档
│   ├── DEVELOPMENT.md      # 开发规范
│   ├── TOOL_GUIDE.md       # 工具开发指南
│   ├── API.md              # API 设计规范
│   ├── AI_ASSISTANT_GUIDE.md  # AI 助手开发规范
│   └── AI_USAGE.md         # AI 辅助开发使用指南
└── public/                 # 静态资源
```

## 快速开始

### 前端开发

```bash
# 安装依赖
npm install
# 或
pnpm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

开发服务器将在 `http://localhost:5173` 启动。

### 后端开发（即将推出）

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 启动服务器
uvicorn app.main:app --reload --port 8000
```

后端 API 将在 `http://localhost:8000` 启动。

## 文档

项目提供了完整的开发文档，帮助你快速上手：

- **[架构设计文档](./docs/ARCHITECTURE.md)**: 了解项目的整体架构和设计理念
- **[开发规范](./docs/DEVELOPMENT.md)**: 代码规范、最佳实践和开发流程
- **[工具开发指南](./docs/TOOL_GUIDE.md)**: 如何创建和集成新工具
- **[API 设计规范](./docs/API.md)**: 后端 API 的设计标准和实现指南
- **[AI 辅助开发指南](./docs/AI_USAGE.md)**: 使用 AI 快速开发工具（推荐）

## 开发新工具

### 方式 1: 使用 AI 辅助开发（推荐）⚡

最快速的方式！查看 [AI 辅助开发指南](./docs/AI_USAGE.md)

```
1. 将 docs/AI_ASSISTANT_GUIDE.md 提供给 AI
2. 描述你的工具需求
3. AI 自动生成符合规范的代码
4. 复制代码到项目中即可使用
```

**示例：**
```
我需要一个 Base64 编码解码工具，支持双向转换，有清空和复制功能。
→ AI 生成完整代码 → 创建文件 → 完成！
```

### 方式 2: 手动开发

想要手动开发？查看我们的[工具开发指南](./docs/TOOL_GUIDE.md)，它提供了：

1. 完整的开发模板
2. 详细的实现步骤
3. 实战示例代码
4. 最佳实践建议

### 快速添加工具

**使用 AI（推荐）：**
```
告诉 AI：我需要一个 [工具描述]
→ 获取代码 → 创建文件 → 完成
```

**手动开发：**
```bash
# 1. 创建工具目录
mkdir -p src/tools/your-tool-name

# 2. 创建必要文件
touch src/tools/your-tool-name/{index.tsx,config.ts,utils.ts}

# 3. 按照模板开发
# 参考 docs/TOOL_GUIDE.md 中的模板

# 4. 注册工具
# 在 src/tools/index.ts 中注册你的工具
```

## 开发规范

为了保证代码质量和项目的可维护性，请遵循以下规范：

- **TypeScript**: 严格模式，避免使用 `any`
- **组件**: 使用函数组件和 Hooks
- **样式**: 优先使用 Tailwind CSS
- **提交**: 遵循 Conventional Commits 规范
- **测试**: 为核心功能编写测试

详细规范请参考 [开发规范文档](./docs/DEVELOPMENT.md)。

## Git 提交规范

```bash
# 新增功能
git commit -m "feat(tools): add JSON formatter"

# 修复问题
git commit -m "fix(ip-lookup): correct validation regex"

# 新增工具
git commit -m "tool(timestamp): add timestamp converter"

# 文档更新
git commit -m "docs(readme): update installation steps"
```

## 功能特性

- 纯前端工具：无需后端，即开即用
- 响应式设计：支持各种屏幕尺寸
- 暗色模式：支持明暗主题切换
- 快速搜索：快速找到需要的工具
- 离线可用：PWA 支持（计划中）
- 开源免费：完全开源，持续更新

## 路线图

### Phase 1（当前）
- [x] 基础架构搭建
- [x] 项目文档完善
- [ ] 3-5 个核心工具实现
- [ ] 基本 UI/UX 完成

### Phase 2
- [ ] 10+ 工具覆盖
- [ ] 用户系统（收藏、历史）
- [ ] 后端 API 集成
- [ ] PWA 支持

### Phase 3
- [ ] 工具市场（第三方工具）
- [ ] API 开放平台
- [ ] 浏览器插件
- [ ] 移动端应用

## 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 遵循开发规范编写代码
4. 提交更改 (`git commit -m 'feat: add some AmazingFeature'`)
5. 推送到分支 (`git push origin feature/AmazingFeature`)
6. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 联系方式

- 项目主页: [GitHub](https://github.com/yourusername/just-tools)
- 问题反馈: [Issues](https://github.com/yourusername/just-tools/issues)
- 讨论交流: [Discussions](https://github.com/yourusername/just-tools/discussions)

## 致谢

- [React](https://react.dev) - UI 框架
- [Vite](https://vitejs.dev) - 构建工具
- [shadcn/ui](https://ui.shadcn.com) - UI 组件库
- [Tailwind CSS](https://tailwindcss.com) - CSS 框架
- [FastAPI](https://fastapi.tiangolo.com) - 后端框架

---

**开始构建你的工具吧！**
