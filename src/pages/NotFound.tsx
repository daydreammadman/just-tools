import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * 404 页面
 */
export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex min-h-[600px] flex-col items-center justify-center text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <span className="text-4xl">404</span>
          </div>
          <h1 className="mt-6 text-4xl font-bold">页面不存在</h1>
          <p className="mt-4 text-muted-foreground max-w-md">
            抱歉，您访问的页面不存在。可能是链接错误或页面已被删除。
          </p>
          <Button onClick={() => navigate('/')} className="mt-8" size="lg">
            <Home className="h-5 w-5 mr-2" />
            返回首页
          </Button>
        </div>
      </div>
    </main>
  );
};
