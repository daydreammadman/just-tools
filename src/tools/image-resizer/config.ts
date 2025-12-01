import type { ToolConfig } from '@/tools/types';
import { Image as ImageIcon } from 'lucide-react';
import { ImageResizer } from './index';

export const toolConfig: ToolConfig = {
  id: 'image-resizer',
  name: '图片分辨率缩放',
  description: '纯前端调整图片尺寸，支持自定义分辨率、压缩质量及格式转换。',
  category: 'media',
  icon: ImageIcon,
  tags: ['图片', 'image', 'resize', '缩放', '分辨率', '压缩'],
  component: ImageResizer,
  requiresBackend: false,
  version: '1.0.0',
};