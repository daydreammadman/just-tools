import type { ToolConfig } from '@/tools/types';
import { FileText } from 'lucide-react';
import { WordCounter } from './index';

export const toolConfig: ToolConfig = {
  id: 'word-counter',
  name: '字数统计',
  description: '实时统计文本的字符数、单词数、行数等信息',
  category: 'text',
  icon: FileText,
  tags: ['字数', '统计', 'word', 'count', '字符', '文本', 'text'],
  component: WordCounter,
  requiresBackend: false,
  version: '1.0.0',
};
