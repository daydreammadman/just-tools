/**
 * File X-Ray (文件字节透视镜) - 配置文件
 */

import type { ToolConfig } from '@/tools/types';
import { ScanSearch } from 'lucide-react';
import { FileHexViewer } from './index';

export const toolConfig: ToolConfig = {
  id: 'file-hex-viewer',
  name: '文件字节透视镜',
  description: '十六进制文件查看器,识别文件魔数和隐藏字符',
  category: 'utilities',
  icon: ScanSearch,
  tags: ['hex', 'hexadecimal', '十六进制', 'binary', '二进制', 'file', '文件', 'magic number', '魔数', 'ghost character', '幽灵字符', 'viewer', '查看器', 'inspector', '检查器'],
  component: FileHexViewer,
  requiresBackend: false,
  version: '1.0.0',
};
