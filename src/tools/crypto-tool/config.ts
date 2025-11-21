import type { ToolConfig } from '@/tools/types';
import { Lock } from 'lucide-react';
import { CryptoTool } from './index';

export const toolConfig: ToolConfig = {
  id: 'crypto-tool',
  name: '加密解密',
  description: '支持 MD5、SHA、Base64、AES 等多种加密编码算法',
  category: 'crypto',
  icon: Lock,
  tags: [
    '加密',
    '解密',
    '哈希',
    'hash',
    'MD5',
    'SHA',
    'SHA256',
    'SHA512',
    'Base64',
    'AES',
    'URL编码',
    'HTML编码',
    'Hex',
    '十六进制',
    'encrypt',
    'decrypt',
    'encode',
    'decode',
  ],
  component: CryptoTool,
  requiresBackend: false,
  version: '1.0.0',
};
