import type { ToolConfig } from '@/tools/types';
import { Clock } from 'lucide-react';
import { TimestampConverter } from './index';

export const toolConfig: ToolConfig = {
  id: 'timestamp-converter',
  name: '时间戳转换',
  description: '时间戳与日期时间互转，支持多种格式和批量转换',
  category: 'utilities',
  icon: Clock,
  tags: ['时间戳', 'timestamp', '日期', 'date', '时间', 'time', 'unix'],
  component: TimestampConverter,
  requiresBackend: false,
  version: '1.0.0',
};
