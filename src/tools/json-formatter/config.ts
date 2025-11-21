import type { ToolConfig } from '@/tools/types';
import { Braces } from 'lucide-react';
import { JSONFormatter } from './index';

export const toolConfig: ToolConfig = {
  id: 'json-formatter',
  name: 'JSON 格式化',
  description: '格式化、压缩和验证 JSON 数据，支持语法错误检测',
  category: 'development',
  icon: Braces,
  tags: ['json', '格式化', 'format', '压缩', 'minify', '验证', 'validate'],
  component: JSONFormatter,
  requiresBackend: false,
  version: '1.0.0',
  examples: [
    {
      input: '{"name":"test","value":123}',
      output: '{\n  "name": "test",\n  "value": 123\n}',
    },
  ],
};
