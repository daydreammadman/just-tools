import { useParams, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getToolById } from '@/tools';

/**
 * 工具详情页
 */
export const ToolPage = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();

  const tool = toolId ? getToolById(toolId) : undefined;

  if (!tool) {
    return (
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <span className="text-2xl">❌</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">工具不存在</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                未找到该工具，请返回首页选择其他工具
              </p>
              <Button onClick={() => navigate('/')} className="mt-4">
                <Home className="h-4 w-4 mr-2" />
                返回首页
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const ToolComponent = tool.component;

  return (
    <main className="flex-1 overflow-auto">
      <ToolComponent />
    </main>
  );
};
