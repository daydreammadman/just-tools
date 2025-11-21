# Just Tools - 问题诊断指南

## 可能的问题和解决方案

### 1. 页面完全空白 - 检查浏览器控制台

**步骤：**
1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签页
3. 查找红色错误信息

**常见错误和解决方案：**

#### 错误 A: 模块导入错误
```
Failed to resolve import "@/components/..."
```

**原因**: 路径别名配置问题

**解决**: 重启开发服务器
```bash
# 停止服务器 (Ctrl+C)
npm run dev
```

#### 错误 B: 组件未定义
```
X is not defined
```

**解决**: 检查组件导入是否正确

#### 错误 C: Tailwind CSS 未生效
页面有内容但样式完全错乱

**解决**: 检查 `src/index.css` 的第一行是否是:
```css
@import "tailwindcss";
```

### 2. 快速测试 - 使用简化版本

**临时替换 App.tsx 测试基础功能:**

```bash
# 1. 备份当前 App.tsx
mv src/App.tsx src/App.backup.tsx

# 2. 使用测试版本
mv src/App.test.tsx src/App.tsx

# 3. 刷新浏览器查看是否显示测试页面
```

如果测试页面能显示，说明问题在组件代码中。

**恢复正常版本:**
```bash
mv src/App.backup.tsx src/App.tsx
```

### 3. 逐步调试法

#### 步骤 1: 检查 main.tsx
打开浏览器控制台，如果看到任何错误，从 `src/main.tsx` 开始检查。

#### 步骤 2: 简化 App.tsx
临时注释掉复杂的组件，只保留最基本的内容:

```tsx
function App() {
  return <div>Hello Just Tools</div>;
}
```

如果能显示，逐步取消注释找出问题组件。

#### 步骤 3: 检查组件依赖
确保所有导入的组件文件都存在:

```bash
# 检查文件是否存在
ls src/components/layout/Header.tsx
ls src/components/layout/Sidebar.tsx
ls src/components/ui/button.tsx
ls src/hooks/useTools.ts
ls src/tools/index.ts
```

### 4. 常见问题检查清单

- [ ] 开发服务器正在运行 (`npm run dev`)
- [ ] 浏览器访问正确的地址 (通常是 http://localhost:5173)
- [ ] 浏览器控制台没有红色错误
- [ ] 所有导入的文件都存在
- [ ] `index.css` 正确导入了 Tailwind
- [ ] `node_modules` 已安装 (如果没有运行 `pnpm install`)

### 5. 完全重置方案

如果以上都不行，尝试完全重置:

```bash
# 1. 停止开发服务器

# 2. 删除 node_modules 和锁文件
rm -rf node_modules pnpm-lock.yaml

# 3. 重新安装依赖
pnpm install

# 4. 重启开发服务器
npm run dev
```

### 6. 验证核心文件

运行以下命令验证关键文件存在:

```bash
echo "=== 检查核心文件 ==="
test -f src/App.tsx && echo "✓ App.tsx 存在" || echo "✗ App.tsx 缺失"
test -f src/main.tsx && echo "✓ main.tsx 存在" || echo "✗ main.tsx 缺失"
test -f src/index.css && echo "✓ index.css 存在" || echo "✗ index.css 缺失"
test -f index.html && echo "✓ index.html 存在" || echo "✗ index.html 缺失"

echo ""
echo "=== 检查组件文件 ==="
test -f src/components/layout/Header.tsx && echo "✓ Header.tsx 存在" || echo "✗ Header.tsx 缺失"
test -f src/components/layout/Sidebar.tsx && echo "✓ Sidebar.tsx 存在" || echo "✗ Sidebar.tsx 缺失"
test -f src/components/ui/button.tsx && echo "✓ button.tsx 存在" || echo "✗ button.tsx 缺失"

echo ""
echo "=== 检查工具文件 ==="
test -f src/tools/index.ts && echo "✓ tools/index.ts 存在" || echo "✗ tools/index.ts 缺失"
test -f src/tools/types.ts && echo "✓ tools/types.ts 存在" || echo "✗ tools/types.ts 缺失"

echo ""
echo "=== 检查 Hooks ==="
test -f src/hooks/useTools.ts && echo "✓ useTools.ts 存在" || echo "✗ useTools.ts 缺失"
test -f src/hooks/useClipboard.ts && echo "✓ useClipboard.ts 存在" || echo "✗ useClipboard.ts 缺失"
```

### 7. 我这里能看到什么？

**你应该看到:**
1. 顶部导航栏（Just Tools logo 和搜索框）
2. 左侧侧边栏（工具分类）
3. 主内容区显示 "暂无工具"（因为还没添加工具）

**如果看不到任何内容:**
- 请打开浏览器控制台截图错误信息
- 或者告诉我控制台显示的错误内容

## 联系我

如果问题仍然存在，请提供:
1. 浏览器控制台的错误信息（截图或文字）
2. npm run dev 的输出
3. 你看到的具体现象（完全空白/部分显示/样式错乱等）
