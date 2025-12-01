import { useNavigate } from 'react-router-dom';
import { X, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getAllCategories, getToolCountByCategory } from '@/tools';
import type { ToolCategory } from '@/tools/types';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  selectedCategory?: ToolCategory | 'all';
  onCategoryChange?: (category: ToolCategory | 'all') => void;
}

/**
 * 侧边栏组件
 * 显示工具分类导航
 */
export const Sidebar = ({
  isOpen = true,
  onClose,
  onToggle,
  selectedCategory = 'all',
  onCategoryChange,
}: SidebarProps) => {
  const navigate = useNavigate();
  const categories = getAllCategories();
  const toolCounts = getToolCountByCategory();
  const totalTools = Object.values(toolCounts).reduce((a, b) => a + b, 0);

  const handleCategoryClick = (category: ToolCategory | 'all') => {
    onCategoryChange?.(category);
    navigate('/');
    if (window.innerWidth < 768) {
      onClose?.();
    }
  };

  return (
    < >
      {/* 移动端遮罩层 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-card transition-all duration-300 md:sticky overflow-hidden',
          'overflow-x-hidden',
          isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 md:w-16'
        )}
      >
        {/* 移动端关闭按钮 */}
        <div className={cn(
          'flex items-center justify-between border-b p-4 md:hidden',
          !isOpen && 'hidden'
        )}>
          <h2 className="text-base font-semibold">工具分类</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">关闭</span>
          </Button>
        </div>

        {/* 分类列表容器 */}
        <div className={cn(
          'flex h-full flex-col',
          !isOpen && 'md:items-center'
        )}>
          {/* 可滚动分类区域 */}
          <nav className={cn(
            'flex-1 overflow-y-auto px-3 py-4 overflow-x-hidden',
            !isOpen && 'md:overflow-visible'
          )}>
            {/* 全部工具 */}
            <button
              onClick={() => handleCategoryClick('all')}
              className={cn(
                ' cursor-pointer group relative mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                selectedCategory === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-accent',
                isOpen ? 'w-full' : 'md:w-auto md:justify-center'
              )}
              title={!isOpen ? '全部工具' : undefined}
            >
              <div
                className={cn(
                  'flex shrink-0 items-center justify-center rounded-lg transition-colors',
                  isOpen ? 'h-9 w-9' : 'md:h-auto md:w-auto',
                  selectedCategory === 'all'
                    ? 'bg-primary-foreground/10'
                    : 'bg-primary/10 group-hover:bg-primary/20'
                )}
              >
                <Layers className={cn(
                  'h-5 w-5',
                  selectedCategory === 'all' ? 'text-primary-foreground' : 'text-primary'
                )} />
              </div>
              {isOpen && (
                <>
                  <span className="flex-1 text-left whitespace-nowrap">全部工具</span>
                  <span
                    className={cn(
                      'flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                      selectedCategory === 'all'
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-primary/10 text-primary'
                    )}
                  >
                    {totalTools}
                  </span>
                </>
              )}
            </button>

            {/* 分隔线 */}
            <div className="my-3 h-px bg-border" />

            {/* 分类列表 */}
            <div className="space-y-0.5">
              {categories.map((category) => {
                const Icon = category.icon;
                const count = toolCounts[category.id] || 0;
                const isSelected = selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={cn(
                      'cursor-pointer group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'hover:bg-accent',
                      isOpen ? 'w-full' : 'md:w-auto md:justify-center'
                    )}
                    title={!isOpen ? category.name : undefined}
                  >
                    <div
                      className={cn(
                        'flex shrink-0 items-center justify-center rounded-lg transition-colors',
                        isOpen ? 'h-9 w-9' : 'md:h-auto md:w-auto',
                        isSelected
                          ? 'bg-primary-foreground/10'
                          : 'bg-muted group-hover:bg-muted/80'
                      )}
                    >
                      <Icon className={cn(
                        'h-5 w-5',
                        isSelected ? 'text-primary-foreground' : 'text-foreground/70'
                      )} />
                    </div>
                    {isOpen && (
                      <>
                        <span className="flex-1 text-left whitespace-nowrap">{category.name}</span>
                        {count > 0 && (
                          <span
                            className={cn(
                              'flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                              isSelected
                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {count}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* 底部信息 */}
          <div className="border-t bg-muted/30">
            <div className={cn(
              'flex items-center justify-between px-4 py-3 text-xs text-muted-foreground',
              !isOpen && 'md:flex-col md:gap-2 md:px-2'
            )}>
              <span className={cn(
                'font-medium',
                !isOpen && 'md:hidden'
              )}>Just Tools</span>
              <span className={cn(
                'rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary',
                !isOpen && 'md:hidden'
              )}>
                v1.0.0
              </span>
              {/* 桌面端收起/展开按钮 */}
              <button
                onClick={onToggle}
                className="cursor-pointer hidden h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-accent md:flex"
                title={isOpen ? '收起侧边栏' : '展开侧边栏'}
              >
                {isOpen ? (
                  <ChevronLeft className="h-6 w-6 " />
                ) : (
                  <ChevronRight className="h-6 w-6 " />
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
