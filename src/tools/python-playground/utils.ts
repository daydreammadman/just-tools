import type { PyodideInterface } from './types';

// Pyodide CDN 地址 (使用 jsdelivr 加速)
const PYODIDE_VERSION = 'v0.24.1';
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/pyodide.js`;

let pyodidePromise: Promise<PyodideInterface> | null = null;

/**
 * 加载 Pyodide 运行时
 * 使用单例模式防止重复加载
 */
export async function loadPyodideRuntime(
  onOutput: (text: string) => void,
  onError: (text: string) => void
): Promise<PyodideInterface> {
  if (window.pyodideInstance) {
    // 如果实例已存在，更新输出回调
    window.pyodideInstance.setStdout({ batched: onOutput });
    window.pyodideInstance.setStderr({ batched: onError });
    return window.pyodideInstance;
  }

  if (!pyodidePromise) {
    pyodidePromise = new Promise((resolve, reject) => {
      // 1. 创建 Script 标签
      const script = document.createElement('script');
      script.src = PYODIDE_URL;
      script.async = true;
      
      script.onload = async () => {
        try {
          // 2. 初始化 Pyodide
          const pyodide = await window.loadPyodide({
            indexURL: `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`,
          });
          
          // 3. 设置输出流捕获
          pyodide.setStdout({ batched: (msg) => onOutput(msg) });
          pyodide.setStderr({ batched: (msg) => onError(msg) });
          
          window.pyodideInstance = pyodide;
          resolve(pyodide);
        } catch (e) {
          reject(e);
        }
      };

      script.onerror = () => reject(new Error('Failed to load Pyodide script'));
      document.body.appendChild(script);
    });
  }

  return pyodidePromise;
}

/**
 * 预设的 Python 示例代码
 */
export const DEFAULT_CODE = `# 欢迎使用 Python 纯前端环境
# 代码在您的浏览器中本地运行！

import sys
import math
from datetime import datetime

print(f"Python 版本: {sys.version}")
print(f"当前时间: {datetime.now()}")

def calculate_circle_area(radius):
    return math.pi * (radius ** 2)

r = 5
area = calculate_circle_area(r)
print(f"半径为 {r} 的圆面积是: {area:.2f}")

# 尝试打印一个列表
print([x**2 for x in range(5)])
`;