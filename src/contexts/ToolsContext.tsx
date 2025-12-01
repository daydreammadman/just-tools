import { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { allTools, getToolsByCategory } from '@/tools';
import type { ToolCategory, ToolConfig } from '@/tools/types';

interface ToolsContextType {
  allTools: ToolConfig[];
  filteredTools: ToolConfig[];
  selectedCategory: ToolCategory | 'all';
  setSelectedCategory: (category: ToolCategory | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ToolsContext = createContext<ToolsContextType | undefined>(undefined);

export const ToolsProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
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

  const value = {
    allTools,
    filteredTools,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
  };

  return <ToolsContext.Provider value={value}>{children}</ToolsContext.Provider>;
};

export const useToolsContext = () => {
  const context = useContext(ToolsContext);
  if (context === undefined) {
    throw new Error('useToolsContext must be used within a ToolsProvider');
  }
  return context;
};
