import type { ToolConfig } from '@/tools/types';
import { ScanSearch } from 'lucide-react';
import { ImageAnalyzer } from './index';

export const toolConfig: ToolConfig = {
  id: 'image-analyzer',
  name: '图片信息分析',
  description: '分析图片的详细信息，包括尺寸、格式、颜色、技术参数等',
  category: 'media',
  icon: ScanSearch,
  tags: ['图片', 'image', '分析', 'analyze', '信息', 'info', 'exif', '颜色', 'color'],
  component: ImageAnalyzer,
  requiresBackend: false,
  version: '1.0.0',
};
