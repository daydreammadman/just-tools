import { useState, useMemo } from 'react';
import { allTools, getToolsByCategory, searchTools } from '@/tools';
import type { ToolCategory, ToolConfig } from '@/tools/types';

/**
 * 工具管理 Hook
 * 提供工具列表、搜索、过滤等功能
 */
export function useTools() {
  const [selectedCategory, setSelectedCategory] = useState<
    ToolCategory | 'all'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 根据分类和搜索过滤工具
  const filteredTools = useMemo(() => {
    let tools: ToolConfig[] = [];

    // 根据分类筛选
    if (selectedCategory === 'all') {
      tools = allTools;
    } else {
      tools = getToolsByCategory(selectedCategory);
    }

    // 根据搜索关键词过滤
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      tools = tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(lowerQuery) ||
          tool.description.toLowerCase().includes(lowerQuery) ||
          tool.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    }

    return tools;
  }, [selectedCategory, searchQuery]);

  return {
    allTools,
    filteredTools,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
  };
}
