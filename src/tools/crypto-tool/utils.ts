/**
 * 加密解密工具函数库
 * 使用 Web Crypto API 和纯 JavaScript 实现
 */

import type {
  Algorithm,
  AlgorithmCategory,
  AlgorithmCategoryInfo,
  AlgorithmOptions,
  AlgorithmRegistry,
  ProcessResult,
} from './types';

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 字符串转 ArrayBuffer
 */
function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
}

/**
 * ArrayBuffer 转十六进制字符串
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * ArrayBuffer 转 Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

/**
 * 十六进制字符串转 ArrayBuffer
 */
function hexToArrayBuffer(hex: string): ArrayBuffer {
  const cleanHex = hex.replace(/\s/g, '');
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes.buffer;
}

/**
 * Base64 转 ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * 生成密钥（用于 AES）
 */
async function deriveKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('just-tools-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// ============================================================================
// 哈希算法
// ============================================================================

/**
 * 计算哈希值
 */
async function computeHash(
  input: string,
  algorithm: 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512',
  outputFormat: 'hex' | 'base64' = 'hex'
): Promise<ProcessResult> {
  try {
    if (algorithm === 'MD5') {
      // MD5 不在 Web Crypto API 中，使用纯 JS 实现
      const hash = md5(input);
      return { success: true, output: hash };
    }

    const buffer = stringToArrayBuffer(input);
    const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
    const output =
      outputFormat === 'hex'
        ? arrayBufferToHex(hashBuffer)
        : arrayBufferToBase64(hashBuffer);

    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : '哈希计算失败',
    };
  }
}

/**
 * MD5 纯 JavaScript 实现
 */
function md5(string: string): string {
  function rotateLeft(value: number, shift: number): number {
    return (value << shift) | (value >>> (32 - shift));
  }

  function addUnsigned(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }

  function f(x: number, y: number, z: number): number {
    return (x & y) | (~x & z);
  }
  function g(x: number, y: number, z: number): number {
    return (x & z) | (y & ~z);
  }
  function h(x: number, y: number, z: number): number {
    return x ^ y ^ z;
  }
  function i(x: number, y: number, z: number): number {
    return y ^ (x | ~z);
  }

  function ff(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function gg(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function hh(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function ii(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function convertToWordArray(str: string): number[] {
    let lWordCount: number;
    const lMessageLength = str.length;
    const lNumberOfWordsTemp1 = lMessageLength + 8;
    const lNumberOfWordsTemp2 =
      (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16;
    const lWordArray: number[] = Array(lNumberOfWords - 1).fill(0);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] =
        lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }

  function wordToHex(value: number): string {
    let hex = '';
    for (let i = 0; i <= 3; i++) {
      const byte = (value >>> (i * 8)) & 255;
      hex += byte.toString(16).padStart(2, '0');
    }
    return hex;
  }

  const x = convertToWordArray(string);
  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  const S11 = 7,
    S12 = 12,
    S13 = 17,
    S14 = 22;
  const S21 = 5,
    S22 = 9,
    S23 = 14,
    S24 = 20;
  const S31 = 4,
    S32 = 11,
    S33 = 16,
    S34 = 23;
  const S41 = 6,
    S42 = 10,
    S43 = 15,
    S44 = 21;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a;
    const BB = b;
    const CC = c;
    const DD = d;

    a = ff(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = ff(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = ff(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = ff(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = ff(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = ff(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = ff(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = ff(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = ff(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = ff(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = ff(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = ff(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = ff(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = ff(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = ff(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = ff(b, c, d, a, x[k + 15], S14, 0x49b40821);
    a = gg(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = gg(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = gg(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = gg(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = gg(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = gg(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = gg(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = gg(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = gg(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = gg(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = gg(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = gg(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = gg(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = gg(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = gg(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = gg(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
    a = hh(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = hh(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = hh(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = hh(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = hh(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = hh(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = hh(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = hh(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = hh(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = hh(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = hh(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = hh(b, c, d, a, x[k + 6], S34, 0x4881d05);
    a = hh(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = hh(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = hh(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = hh(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
    a = ii(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = ii(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = ii(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = ii(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = ii(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = ii(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = ii(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = ii(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = ii(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = ii(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = ii(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = ii(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = ii(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = ii(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = ii(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = ii(b, c, d, a, x[k + 9], S44, 0xeb86d391);

    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

// ============================================================================
// 编码算法
// ============================================================================

/**
 * Base64 编码
 */
function base64Encode(input: string): ProcessResult {
  try {
    // 使用 TextEncoder 处理 Unicode
    const encoder = new TextEncoder();
    const bytes = encoder.encode(input);
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    const output = btoa(binary);
    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'Base64 编码失败',
    };
  }
}

/**
 * Base64 解码
 */
function base64Decode(input: string): ProcessResult {
  try {
    const binary = atob(input.trim());
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    const output = decoder.decode(bytes);
    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: '无效的 Base64 字符串',
    };
  }
}

/**
 * URL 编码
 */
function urlEncode(input: string): ProcessResult {
  try {
    const output = encodeURIComponent(input);
    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'URL 编码失败',
    };
  }
}

/**
 * URL 解码
 */
function urlDecode(input: string): ProcessResult {
  try {
    const output = decodeURIComponent(input.trim());
    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: '无效的 URL 编码字符串',
    };
  }
}

/**
 * HTML 实体编码
 */
function htmlEncode(input: string): ProcessResult {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  const output = input.replace(/[&<>"']/g, (char) => map[char]);
  return { success: true, output };
}

/**
 * HTML 实体解码
 */
function htmlDecode(input: string): ProcessResult {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&apos;': "'",
  };
  const output = input.replace(
    /&(amp|lt|gt|quot|#39|#x27|apos);/g,
    (match) => map[match] || match
  );
  return { success: true, output };
}

/**
 * 十六进制编码
 */
function hexEncode(input: string): ProcessResult {
  try {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(input);
    const output = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(' ');
    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'Hex 编码失败',
    };
  }
}

/**
 * 十六进制解码
 */
function hexDecode(input: string): ProcessResult {
  try {
    // 移除空格和其他分隔符
    const cleanHex = input.replace(/[\s,;:-]/g, '');
    if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
      return { success: false, output: '', error: '无效的十六进制字符' };
    }
    if (cleanHex.length % 2 !== 0) {
      return { success: false, output: '', error: '十六进制字符串长度必须为偶数' };
    }
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
    }
    const decoder = new TextDecoder();
    const output = decoder.decode(bytes);
    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: '十六进制解码失败',
    };
  }
}

// ============================================================================
// 对称加密 (AES)
// ============================================================================

/**
 * AES 加密
 */
async function aesEncrypt(
  input: string,
  options?: AlgorithmOptions
): Promise<ProcessResult> {
  try {
    const key = options?.key;
    if (!key) {
      return { success: false, output: '', error: '请输入密钥' };
    }

    const cryptoKey = await deriveKey(key);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encoder.encode(input)
    );

    // 合并 IV 和密文
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    const output =
      options?.outputFormat === 'hex'
        ? arrayBufferToHex(combined.buffer)
        : arrayBufferToBase64(combined.buffer);

    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'AES 加密失败',
    };
  }
}

/**
 * AES 解密
 */
async function aesDecrypt(
  input: string,
  options?: AlgorithmOptions
): Promise<ProcessResult> {
  try {
    const key = options?.key;
    if (!key) {
      return { success: false, output: '', error: '请输入密钥' };
    }

    // 解析输入（自动检测格式）
    let combined: ArrayBuffer;
    try {
      // 尝试 Base64
      combined = base64ToArrayBuffer(input.trim());
    } catch {
      // 尝试 Hex
      combined = hexToArrayBuffer(input.trim());
    }

    const combinedArray = new Uint8Array(combined);
    const iv = combinedArray.slice(0, 12);
    const encrypted = combinedArray.slice(12);

    const cryptoKey = await deriveKey(key);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encrypted
    );

    const decoder = new TextDecoder();
    const output = decoder.decode(decrypted);

    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: '解密失败，请检查密钥和密文是否正确',
    };
  }
}

// ============================================================================
// 算法注册表
// ============================================================================

/**
 * 算法分类信息
 */
export const algorithmCategories: AlgorithmCategoryInfo[] = [
  {
    id: 'hash',
    name: '哈希算法',
    description: '单向散列，不可逆',
  },
  {
    id: 'encoding',
    name: '编码转换',
    description: '可逆编码转换',
  },
  {
    id: 'cipher',
    name: '对称加密',
    description: '需要密钥的可逆加密',
  },
];

/**
 * 所有支持的算法
 * 扩展时只需在此添加新算法
 */
export const algorithms: AlgorithmRegistry = {
  // 哈希算法
  md5: {
    id: 'md5',
    name: 'MD5',
    description: '128 位哈希值，已不推荐用于安全场景',
    category: 'hash',
    supportsDecode: false,
    requiresKey: false,
    encode: (input) => {
      const result = md5(input);
      return { success: true, output: result };
    },
  },
  sha1: {
    id: 'sha1',
    name: 'SHA-1',
    description: '160 位哈希值，已不推荐用于安全场景',
    category: 'hash',
    supportsDecode: false,
    requiresKey: false,
    encode: (input, options) => {
      // 包装异步函数为同步返回
      computeHash(input, 'SHA-1', options?.outputFormat || 'hex').then(() => {
        // result processed async
      });
      // 由于需要同步返回，这里使用特殊处理
      return { success: true, output: '', error: 'async' };
    },
  },
  sha256: {
    id: 'sha256',
    name: 'SHA-256',
    description: '256 位哈希值，推荐使用',
    category: 'hash',
    supportsDecode: false,
    requiresKey: false,
    encode: () => ({ success: true, output: '', error: 'async' }),
  },
  sha512: {
    id: 'sha512',
    name: 'SHA-512',
    description: '512 位哈希值，更高安全性',
    category: 'hash',
    supportsDecode: false,
    requiresKey: false,
    encode: () => ({ success: true, output: '', error: 'async' }),
  },

  // 编码算法
  base64: {
    id: 'base64',
    name: 'Base64',
    description: '常用的二进制到文本编码',
    category: 'encoding',
    supportsDecode: true,
    requiresKey: false,
    encode: (input) => base64Encode(input),
    decode: (input) => base64Decode(input),
  },
  url: {
    id: 'url',
    name: 'URL Encode',
    description: 'URL 特殊字符编码',
    category: 'encoding',
    supportsDecode: true,
    requiresKey: false,
    encode: (input) => urlEncode(input),
    decode: (input) => urlDecode(input),
  },
  html: {
    id: 'html',
    name: 'HTML Entities',
    description: 'HTML 特殊字符实体编码',
    category: 'encoding',
    supportsDecode: true,
    requiresKey: false,
    encode: (input) => htmlEncode(input),
    decode: (input) => htmlDecode(input),
  },
  hex: {
    id: 'hex',
    name: 'Hex',
    description: '十六进制编码',
    category: 'encoding',
    supportsDecode: true,
    requiresKey: false,
    encode: (input) => hexEncode(input),
    decode: (input) => hexDecode(input),
  },

  // 对称加密
  aes: {
    id: 'aes',
    name: 'AES-256-GCM',
    description: '高级加密标准，256 位密钥',
    category: 'cipher',
    supportsDecode: true,
    requiresKey: true,
    keyPlaceholder: '输入加密密钥...',
    encode: () => ({ success: true, output: '', error: 'async' }),
    decode: () => ({ success: true, output: '', error: 'async' }),
  },
};

// ============================================================================
// 统一处理函数
// ============================================================================

/**
 * 统一的加密/编码处理函数
 */
export async function processEncode(
  algorithmId: string,
  input: string,
  options?: AlgorithmOptions
): Promise<ProcessResult> {
  const algorithm = algorithms[algorithmId];
  if (!algorithm) {
    return { success: false, output: '', error: '未知的算法' };
  }

  if (!input.trim()) {
    return { success: false, output: '', error: '请输入内容' };
  }

  // 处理需要密钥的算法
  if (algorithm.requiresKey && !options?.key) {
    return { success: false, output: '', error: '请输入密钥' };
  }

  // 处理异步算法
  if (algorithmId.startsWith('sha')) {
    const hashName = algorithmId.toUpperCase().replace('SHA', 'SHA-') as
      | 'SHA-1'
      | 'SHA-256'
      | 'SHA-512';
    return computeHash(input, hashName, options?.outputFormat || 'hex');
  }

  if (algorithmId === 'aes') {
    return aesEncrypt(input, options);
  }

  // 同步算法
  return algorithm.encode(input, options);
}

/**
 * 统一的解密/解码处理函数
 */
export async function processDecode(
  algorithmId: string,
  input: string,
  options?: AlgorithmOptions
): Promise<ProcessResult> {
  const algorithm = algorithms[algorithmId];
  if (!algorithm) {
    return { success: false, output: '', error: '未知的算法' };
  }

  if (!algorithm.supportsDecode) {
    return { success: false, output: '', error: '该算法不支持解码' };
  }

  if (!input.trim()) {
    return { success: false, output: '', error: '请输入内容' };
  }

  if (algorithm.requiresKey && !options?.key) {
    return { success: false, output: '', error: '请输入密钥' };
  }

  if (algorithmId === 'aes') {
    return aesDecrypt(input, options);
  }

  return algorithm.decode!(input, options);
}

/**
 * 获取指定分类的算法列表
 */
export function getAlgorithmsByCategory(category: AlgorithmCategory): Algorithm[] {
  return Object.values(algorithms).filter((algo) => algo.category === category);
}

/**
 * 获取所有算法
 */
export function getAllAlgorithms(): Algorithm[] {
  return Object.values(algorithms);
}
