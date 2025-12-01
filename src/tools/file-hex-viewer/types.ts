/**
 * 文件字节透视镜 - 类型定义
 */

/**
 * 文件魔数签名定义
 */
export interface MagicNumber {
  signature: number[];
  format: string;
  description: string;
  color: string;
}

/**
 * 幽灵字符定义
 */
export interface GhostCharacter {
  position: number;
  char: string;
  codePoint: number;
  description: string;
}

/**
 * 字节信息
 */
export interface ByteInfo {
  offset: number;
  value: number;
  binary: string;
  octal: string;
  decimal: string;
  hex: string;
  ascii: string;
}

/**
 * 文件分析结果
 */
export interface FileAnalysis {
  magicNumber: MagicNumber | null;
  ghostCharacters: GhostCharacter[];
  hasBOM: boolean;
  detectedEncoding: string;
}
