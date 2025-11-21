/**
 * 加密解密工具类型定义
 * 采用可插拔架构设计，方便扩展新算法
 */

/**
 * 算法分类
 */
export type AlgorithmCategory = 'hash' | 'encoding' | 'cipher';

/**
 * 算法分类信息
 */
export interface AlgorithmCategoryInfo {
  id: AlgorithmCategory;
  name: string;
  description: string;
}

/**
 * 算法操作方向
 */
export type OperationDirection = 'encode' | 'decode';

/**
 * 算法配置选项（用于需要额外参数的算法，如 AES）
 */
export interface AlgorithmOptions {
  /** 密钥（对称加密用） */
  key?: string;
  /** 初始化向量（某些加密模式用） */
  iv?: string;
  /** 输出格式 */
  outputFormat?: 'hex' | 'base64';
  /** 字符编码 */
  encoding?: 'utf-8' | 'ascii' | 'latin1';
}

/**
 * 算法处理结果
 */
export interface ProcessResult {
  success: boolean;
  output: string;
  error?: string;
}

/**
 * 算法定义接口 - 核心扩展接口
 * 新增算法只需实现此接口并注册
 */
export interface Algorithm {
  /** 算法唯一标识 */
  id: string;
  /** 算法显示名称 */
  name: string;
  /** 算法描述 */
  description: string;
  /** 算法分类 */
  category: AlgorithmCategory;
  /** 是否支持解码（哈希算法为 false） */
  supportsDecode: boolean;
  /** 是否需要密钥 */
  requiresKey: boolean;
  /** 密钥提示文字 */
  keyPlaceholder?: string;
  /** 编码/加密函数 */
  encode: (input: string, options?: AlgorithmOptions) => ProcessResult;
  /** 解码/解密函数（可选） */
  decode?: (input: string, options?: AlgorithmOptions) => ProcessResult;
}

/**
 * 算法注册表类型
 */
export type AlgorithmRegistry = Record<string, Algorithm>;

/**
 * 工具状态
 */
export interface CryptoToolState {
  /** 当前选中的算法 ID */
  selectedAlgorithm: string;
  /** 当前操作方向 */
  direction: OperationDirection;
  /** 输入文本 */
  input: string;
  /** 输出文本 */
  output: string;
  /** 密钥（如果需要） */
  key: string;
  /** 是否正在处理 */
  isProcessing: boolean;
  /** 错误信息 */
  error: string | null;
  /** 输出格式 */
  outputFormat: 'hex' | 'base64';
}
