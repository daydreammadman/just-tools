import { useState, useCallback } from 'react';

/**
 * 复制到剪贴板的 Hook
 * @returns 复制函数和复制状态
 */
export function useClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);

      // 2秒后重置状态
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);

      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setIsCopied(false);
      return false;
    }
  }, []);

  return { copyToClipboard, isCopied };
}
