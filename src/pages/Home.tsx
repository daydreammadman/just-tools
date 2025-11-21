import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToolsContext } from '@/contexts/ToolsContext';
import { getCategoryById } from '@/tools';

/**
 * 首页 - 工具列表
 */
export const Home: FC = () => {
  const navigate = useNavigate();
  const { filteredTools, selectedCategory } = useToolsContext();

  // 获取当前分类信息
  const categoryInfo = selectedCategory !== 'all'
    ? getCategoryById(selectedCategory)
    : null;

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-6">
        <div className="mx-auto max-w-7xl">
          {/* 页面标题 */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">
              {selectedCategory === 'all' ? '全部工具' : categoryInfo?.name || '工具列表'}
            </h2>
            {selectedCategory === 'all' ? (
              <p className="mt-2 text-muted-foreground">
                共找到 {filteredTools.length} 个工具
              </p>
            ) : categoryInfo ? (
              <>
                <p className="mt-2 text-muted-foreground">
                  {categoryInfo.description}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  共找到 {filteredTools.length} 个工具
                </p>
              </>
            ) : (
              <p className="mt-2 text-muted-foreground">
                共找到 {filteredTools.length} 个工具
              </p>
            )}
          </div>

          {/* 工具列表 */}
          {filteredTools.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">暂无工具</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                该分类下还没有工具，敬请期待
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => navigate(`/tool/${tool.id}`)}
                    className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md text-left cursor-pointer"
                  >
                    {/* 工具图标 */}
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-6 w-6" />
                    </div>

                    {/* 工具信息 */}
                    <h3 className="mb-2 text-lg font-semibold">
                      {tool.name}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>

                    {/* 标签 */}
                    <div className="flex flex-wrap gap-2">
                      {tool.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* 悬浮效果 */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
