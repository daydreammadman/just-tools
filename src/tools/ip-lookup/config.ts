import type { ToolConfig } from '@/tools/types';
import { Globe } from 'lucide-react';
import { IpLookupTool } from './index';

export const toolConfig: ToolConfig = {
  id: 'ip-lookup',
  name: 'IP 归属地查询',
  description: '查询 IP 地址的地理位置、运营商、ISP 等详细信息',
  category: 'network',
  icon: Globe,
  tags: ['ip', 'address', 'geo', 'location', '归属地', '网络'],
  component: IpLookupTool,
  requiresBackend: false, // 纯前端模式
  version: '1.0.0',
};