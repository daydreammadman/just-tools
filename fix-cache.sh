#!/bin/bash

echo "=== 清理 Vite 缓存并重启 ==="

echo "1. 停止开发服务器（如果正在运行）"
echo "   请按 Ctrl+C 停止服务器"
echo ""

echo "2. 清理 Vite 缓存"
rm -rf node_modules/.vite
echo "   ✓ Vite 缓存已清理"
echo ""

echo "3. 重新启动开发服务器"
echo "   运行: npm run dev"
echo ""

echo "=== 完成 ==="
echo "现在请运行: npm run dev"
