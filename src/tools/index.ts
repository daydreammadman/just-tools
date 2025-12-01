import type {
  ToolConfig,
  ToolCategory,
  CategoryInfo,
} from './types';
import {
  Type,
  Globe,
  RefreshCw,
  Lock,
  Code2, // 建议用 Code2，比 Code 好看一点
  Wrench,
  Image, // 新增

} from 'lucide-react';
// 导入工具配置
import { toolConfig as jsonFormatterConfig } from './json-formatter/config';
import { toolConfig as IpLookupConfig } from './ip-lookup/config';
import { toolConfig as wordCounterConfig } from './word-counter/config';
import { toolConfig as imageConverterConfig } from './image-converter/config';
import { toolConfig as imageAnalyzerConfig } from './image-analyzer/config';
import { toolConfig as cryptoToolConfig } from './crypto-tool/config';
import { toolConfig as systemInspectorConfig } from './system-inspector/config';
import { toolConfig as fileHexViewerConfig } from './file-hex-viewer/config';
import { toolConfig as timestampConverterConfig } from './timestamp-converter/config';
import { toolConfig as imageResizerConfig } from './image-resizer/config';

/**
 * 工具注册表
 * 新增工具时在此数组中添加工具配置
 */
export const allTools: ToolConfig[] = [
  jsonFormatterConfig,
  IpLookupConfig,
  wordCounterConfig,
  imageConverterConfig,
  imageAnalyzerConfig,
  cryptoToolConfig,
  systemInspectorConfig,
  fileHexViewerConfig,
  timestampConverterConfig,
  imageResizerConfig,
];

/**
 * 工具分类信息
 */
export const categories: CategoryInfo[] = [
  {
    id: 'development', // 把开发工具放前面，因为这是你的核心受众
    name: '开发运维',
    description: 'JSON/XML、Cron、正则表达式测试',
    icon: Code2,
  },
  {
    id: 'network',
    name: '网络工具',
    description: 'IP 查询、Ping 检测、Whois 查询',
    icon: Globe,
  },
  {
    id: 'text',
    name: '文本处理',
    description: '字数统计、文本去重、差异对比',
    icon: Type,
  },
  {
    id: 'crypto',
    name: '加密解密',
    description: 'MD5、SHA、Base64、AES 加密',
    icon: Lock,
  },
  {
    id: 'media', // ✨ 新增建议
    name: '图片媒体',
    description: '二维码生成、图片压缩、格式转换',
    icon: Image,
  },
  {
    id: 'conversion',
    name: '单位换算',
    description: '进制转换、颜色转换、时间戳转换',
    icon: RefreshCw,
  },
  {
    id: 'utilities',
    name: '日常工具',
    description: '生成随机密码、计算器、调色板',
    icon: Wrench,
  },
];


/**
 * 根据 ID 获取工具配置
 * @param id - 工具 ID
 * @returns 工具配置对象，未找到返回 undefined
 */
export function getToolById(id: string): ToolConfig | undefined {
  return allTools.find((tool) => tool.id === id);
}

/**
 * 根据分类获取工具列表
 * @param category - 工具分类
 * @returns 该分类下的所有工具
 */
export function getToolsByCategory(category: ToolCategory): ToolConfig[] {
  return allTools.filter((tool) => tool.category === category);
}

/**
 * 搜索工具
 * @param query - 搜索关键词
 * @returns 匹配的工具列表
 */
export function searchTools(query: string): ToolConfig[] {
  if (!query.trim()) {
    return allTools;
  }

  const lowerQuery = query.toLowerCase();

  return allTools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * 获取所有工具分类
 * @returns 工具分类信息数组
 */
export function getAllCategories(): CategoryInfo[] {
  return categories;
}

/**
 * 根据分类 ID 获取分类信息
 * @param categoryId - 分类 ID
 * @returns 分类信息对象，未找到返回 undefined
 */
export function getCategoryById(
  categoryId: ToolCategory
): CategoryInfo | undefined {
  return categories.find((cat) => cat.id === categoryId);
}

/**
 * 获取工具总数
 * @returns 已注册的工具数量
 */
export function getToolCount(): number {
  return allTools.length;
}

/**
 * 获取每个分类的工具数量
 * @returns 分类 ID 到工具数量的映射
 */
export function getToolCountByCategory(): Record<ToolCategory, number> {
  const counts: Record<string, number> = {};

  categories.forEach((cat) => {
    counts[cat.id] = getToolsByCategory(cat.id).length;
  });

  return counts as Record<ToolCategory, number>;
}
