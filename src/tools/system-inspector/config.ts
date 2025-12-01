import type { ToolConfig } from '@/tools/types';
import { ScanSearch } from 'lucide-react';
import { SystemInspector } from './index';

export const toolConfig: ToolConfig = {
  id: 'system-inspector',
  name: '浏览器指纹检测',
  description: '展示浏览器能获取的客户端信息（仅限 Web API），了解指纹追踪原理及隐私保护机制',
  category: 'development',
  icon: ScanSearch,
  tags: [
    '浏览器指纹',
    '隐私检测',
    'Web API',
    'fingerprint',
    'privacy',
    'browser',
    'User Agent',
    '客户端信息',
    '指纹追踪',
  ],
  component: SystemInspector,
  requiresBackend: true,
  version: '1.0.0',
};
