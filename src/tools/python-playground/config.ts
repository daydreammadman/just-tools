import type { ToolConfig } from '@/tools/types';
import { Terminal } from 'lucide-react';
import { PythonPlayground } from './index';

export const toolConfig: ToolConfig = {
  id: 'python-playground',
  name: 'Python 纯前端环境',
  description: '基于 WebAssembly 的 Python 运行环境，无需后端，直接在浏览器中执行 Python 代码。',
  category: 'development',
  icon: Terminal,
  tags: ['python', 'IDE', 'compiler', '运行环境', 'wasm', '脚本'],
  component: PythonPlayground,
  requiresBackend: false,
  version: '1.0.0',
};