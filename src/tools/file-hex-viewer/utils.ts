/**
 * 文件字节透视镜 - 工具函数
 */

import type { MagicNumber, GhostCharacter, ByteInfo, FileAnalysis } from './types';

/**
 * 常见文件魔数签名数据库
 */
const MAGIC_NUMBERS: MagicNumber[] = [
  {
    signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    format: 'PNG',
    description: 'Portable Network Graphics 图像',
    color: 'text-green-400',
  },
  {
    signature: [0xff, 0xd8, 0xff],
    format: 'JPEG',
    description: 'JPEG 图像',
    color: 'text-blue-400',
  },
  {
    signature: [0x47, 0x49, 0x46, 0x38],
    format: 'GIF',
    description: 'Graphics Interchange Format 图像',
    color: 'text-purple-400',
  },
  {
    signature: [0x25, 0x50, 0x44, 0x46],
    format: 'PDF',
    description: 'Portable Document Format 文档',
    color: 'text-red-400',
  },
  {
    signature: [0x50, 0x4b, 0x03, 0x04],
    format: 'ZIP',
    description: 'ZIP 压缩文件',
    color: 'text-yellow-400',
  },
  {
    signature: [0x52, 0x61, 0x72, 0x21],
    format: 'RAR',
    description: 'RAR 压缩文件',
    color: 'text-orange-400',
  },
  {
    signature: [0x1f, 0x8b],
    format: 'GZIP',
    description: 'GZIP 压缩文件',
    color: 'text-cyan-400',
  },
  {
    signature: [0x42, 0x4d],
    format: 'BMP',
    description: 'Bitmap 图像',
    color: 'text-pink-400',
  },
  {
    signature: [0x49, 0x49, 0x2a, 0x00],
    format: 'TIFF (LE)',
    description: 'TIFF 图像 (Little Endian)',
    color: 'text-indigo-400',
  },
  {
    signature: [0x4d, 0x4d, 0x00, 0x2a],
    format: 'TIFF (BE)',
    description: 'TIFF 图像 (Big Endian)',
    color: 'text-indigo-400',
  },
  {
    signature: [0x7f, 0x45, 0x4c, 0x46],
    format: 'ELF',
    description: 'Linux 可执行文件',
    color: 'text-emerald-400',
  },
  {
    signature: [0x4d, 0x5a],
    format: 'EXE',
    description: 'Windows 可执行文件',
    color: 'text-rose-400',
  },
];

/**
 * 幽灵字符定义
 */
const GHOST_CHARS = {
  ZERO_WIDTH_SPACE: { code: 0x200b, name: '零宽空格 (ZWSP)' },
  ZERO_WIDTH_NON_JOINER: { code: 0x200c, name: '零宽非连接符 (ZWNJ)' },
  ZERO_WIDTH_JOINER: { code: 0x200d, name: '零宽连接符 (ZWJ)' },
  BOM: { code: 0xfeff, name: 'BOM (Byte Order Mark)' },
  SOFT_HYPHEN: { code: 0x00ad, name: '软连字符' },
};

/**
 * 检测文件魔数
 * @param buffer - 文件数据缓冲区
 * @returns 匹配的魔数信息，未匹配返回 null
 */
export function detectMagicNumber(buffer: ArrayBuffer): MagicNumber | null {
  const bytes = new Uint8Array(buffer);

  for (const magic of MAGIC_NUMBERS) {
    if (bytes.length < magic.signature.length) {
      continue;
    }

    let match = true;
    for (let i = 0; i < magic.signature.length; i++) {
      if (bytes[i] !== magic.signature[i]) {
        match = false;
        break;
      }
    }

    if (match) {
      return magic;
    }
  }

  return null;
}

/**
 * 检测幽灵字符
 * @param buffer - 文件数据缓冲区
 * @returns 检测到的幽灵字符列表
 */
export function detectGhostCharacters(buffer: ArrayBuffer): GhostCharacter[] {
  const ghostChars: GhostCharacter[] = [];

  try {
    // 尝试将缓冲区解码为文本
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const text = decoder.decode(buffer);

    // 检查每个幽灵字符
    for (const [key, ghost] of Object.entries(GHOST_CHARS)) {
      const char = String.fromCharCode(ghost.code);
      let index = text.indexOf(char);

      while (index !== -1) {
        ghostChars.push({
          position: index,
          char: key,
          codePoint: ghost.code,
          description: ghost.name,
        });
        index = text.indexOf(char, index + 1);
      }
    }
  } catch (error) {
    // 如果不是文本文件，忽略错误
    console.debug('File is not a text file:', error);
  }

  return ghostChars;
}

/**
 * 检测 BOM
 * @param buffer - 文件数据缓冲区
 * @returns 是否包含 BOM
 */
export function hasBOM(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer);

  // UTF-8 BOM: EF BB BF
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return true;
  }

  // UTF-16 BE BOM: FE FF
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return true;
  }

  // UTF-16 LE BOM: FF FE
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return true;
  }

  return false;
}

/**
 * 检测文件编码
 * @param buffer - 文件数据缓冲区
 * @returns 检测到的编码
 */
export function detectEncoding(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  // 检查 BOM
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return 'UTF-8 (with BOM)';
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return 'UTF-16 BE (with BOM)';
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return 'UTF-16 LE (with BOM)';
  }

  // 简单检测：如果大部分字节在 ASCII 范围内，可能是 UTF-8
  let asciiCount = 0;
  for (let i = 0; i < Math.min(bytes.length, 1000); i++) {
    if (bytes[i] < 128) {
      asciiCount++;
    }
  }

  if (asciiCount / Math.min(bytes.length, 1000) > 0.9) {
    return 'ASCII/UTF-8';
  }

  return 'Binary';
}

/**
 * 完整分析文件
 * @param buffer - 文件数据缓冲区
 * @returns 文件分析结果
 */
export function analyzeFile(buffer: ArrayBuffer): FileAnalysis {
  return {
    magicNumber: detectMagicNumber(buffer),
    ghostCharacters: detectGhostCharacters(buffer),
    hasBOM: hasBOM(buffer),
    detectedEncoding: detectEncoding(buffer),
  };
}

/**
 * 将字节转换为十六进制字符串
 * @param byte - 字节值
 * @returns 十六进制字符串（2位，补0）
 */
export function byteToHex(byte: number): string {
  return byte.toString(16).toUpperCase().padStart(2, '0');
}

/**
 * 将字节转换为二进制字符串
 * @param byte - 字节值
 * @returns 二进制字符串（8位，补0）
 */
export function byteToBinary(byte: number): string {
  return byte.toString(2).padStart(8, '0');
}

/**
 * 将字节转换为八进制字符串
 * @param byte - 字节值
 * @returns 八进制字符串（3位，补0）
 */
export function byteToOctal(byte: number): string {
  return byte.toString(8).padStart(3, '0');
}

/**
 * 将字节转换为 ASCII 字符
 * @param byte - 字节值
 * @returns ASCII 字符或点（不可打印字符）
 */
export function byteToASCII(byte: number): string {
  // 可打印 ASCII: 32-126
  if (byte >= 32 && byte <= 126) {
    return String.fromCharCode(byte);
  }
  return '·';
}

/**
 * 获取字节的完整信息
 * @param offset - 字节偏移量
 * @param byte - 字节值
 * @returns 字节信息对象
 */
export function getByteInfo(offset: number, byte: number): ByteInfo {
  return {
    offset,
    value: byte,
    binary: byteToBinary(byte),
    octal: byteToOctal(byte),
    decimal: byte.toString(),
    hex: byteToHex(byte),
    ascii: byteToASCII(byte),
  };
}

/**
 * 格式化偏移量为十六进制字符串
 * @param offset - 偏移量
 * @returns 格式化的偏移量字符串（8位，补0）
 */
export function formatOffset(offset: number): string {
  return offset.toString(16).toUpperCase().padStart(8, '0');
}

/**
 * 验证文件大小
 * @param file - 文件对象
 * @param maxSizeMB - 最大大小（MB）
 * @returns 是否在限制内
 */
export function validateFileSize(file: File, maxSizeMB: number = 2): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}
