import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Home } from './pages/Home';
import { ToolPage } from './pages/ToolPage';
import { NotFound } from './pages/NotFound';
import { ToolsProvider, useToolsContext } from './contexts/ToolsContext';
import { ThemeProvider } from './components/theme-provider';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useToolsContext();
  const location = useLocation();

  // 判断是否在工具页面
  const isToolPage = location.pathname.startsWith('/tool/');

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* 顶部导航栏 */}
      <Header
        onMenuClick={handleSidebarToggle}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        showBackButton={isToolPage}
      />

      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 侧边栏 */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggle={handleSidebarToggle}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* 路由内容区 */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tool/:toolId" element={<ToolPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="just-tools-theme">
        <ToolsProvider>
          <AppContent />
        </ToolsProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
