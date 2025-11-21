import type { ToolConfig } from '@/tools/types';
import { RefreshCw } from 'lucide-react';
import { ImageConverter } from './index';

export const toolConfig: ToolConfig = {
  id: 'image-converter',
  name: '图片格式转换',
  description: '转换图片格式，支持 PNG、JPEG、WebP、GIF、BMP、ICO 等格式互转',
  category: 'media',
  icon: RefreshCw,
  tags: ['图片', 'image', '转换', 'convert', 'png', 'jpeg', 'webp', 'gif', '格式'],
  component: ImageConverter,
  requiresBackend: false,
  version: '1.0.0',
};
