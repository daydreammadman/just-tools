import type { LucideProps } from 'lucide-react';
import type { FC } from 'react';

/**
 * 工具分类枚举
 */
export type ToolCategory =
  | 'text'          // 文本处理
  | 'network'       // 网络工具
  | 'crypto'        // 加密解密
  | 'development'   // 开发运维
  | 'media'         // 图片媒体
  | 'conversion'    // 单位换算
  | 'utilities';    // 日常工具

/**
 * 工具配置接口
 */
export interface ToolConfig {
  /** 唯一标识符，使用 kebab-case */
  id: string;

  /** 工具中文名称 */
  name: string;

  /** 工具描述 */
  description: string;

  /** 工具分类 */
  category: ToolCategory;

  /** Lucide 图标组件 */
  icon: FC<LucideProps>;

  /** 搜索标签（中英文） */
  tags: string[];

  /** 工具组件 */
  component: FC;

  /** 是否需要后端支持 */
  requiresBackend: boolean;

  /** 版本号 */
  version: string;

  /** 作者信息（可选） */
  author?: string;

  /** 示例数据（可选） */
  examples?: ToolExample[];
}

/**
 * 工具示例数据
 */
export interface ToolExample {
  /** 示例输入 */
  input: string;

  /** 示例输出 */
  output: string;

  /** 示例说明（可选） */
  description?: string;
}

/**
 * 工具元数据（用于用户数据存储）
 */
export interface ToolMetadata {
  /** 使用次数 */
  usageCount?: number;

  /** 最后使用时间戳 */
  lastUsed?: number;

  /** 是否收藏 */
  isFavorite?: boolean;
}

/**
 * 分类信息
 */
export interface CategoryInfo {
  /** 分类 ID */
  id: ToolCategory;

  /** 分类中文名称 */
  name: string;

  /** 分类描述 */
  description: string;

  /** 分类图标 */
  icon: FC<LucideProps>;
}
