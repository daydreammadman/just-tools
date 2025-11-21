export type IndentSize = 2 | 4;

export interface JSONParseResult {
  success: boolean;
  data?: unknown;
  error?: {
    message: string;
    line?: number;
    column?: number;
    position?: number;
  };
}

export interface FormatResult {
  success: boolean;
  output: string;
  error?: {
    message: string;
    line?: number;
    column?: number;
    position?: number;
  };
}

/**
 * 解析 JSON 字符串
 */
export function parseJSON(input: string): JSONParseResult {
  if (!input.trim()) {
    return {
      success: false,
      error: { message: '请输入 JSON 内容' },
    };
  }

  try {
    const data = JSON.parse(input);
    return { success: true, data };
  } catch (e) {
    const error = e as SyntaxError;
    const errorInfo = extractErrorPosition(error.message, input);

    return {
      success: false,
      error: {
        message: error.message,
        ...errorInfo,
      },
    };
  }
}

/**
 * 从错误信息中提取位置
 */
function extractErrorPosition(
  message: string,
  input: string
): { line?: number; column?: number; position?: number } {
  // 尝试从错误信息中提取位置
  const posMatch = message.match(/position\s+(\d+)/i);
  if (posMatch) {
    const position = parseInt(posMatch[1], 10);
    const { line, column } = positionToLineColumn(input, position);
    return { line, column, position };
  }

  const lineMatch = message.match(/line\s+(\d+)/i);
  const columnMatch = message.match(/column\s+(\d+)/i);

  return {
    line: lineMatch ? parseInt(lineMatch[1], 10) : undefined,
    column: columnMatch ? parseInt(columnMatch[1], 10) : undefined,
  };
}

/**
 * 将字符位置转换为行列
 */
function positionToLineColumn(
  input: string,
  position: number
): { line: number; column: number } {
  const lines = input.substring(0, position).split('\n');
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;
  return { line, column };
}

/**
 * 格式化 JSON
 */
export function formatJSON(input: string, indent: IndentSize = 2): FormatResult {
  const parseResult = parseJSON(input);

  if (!parseResult.success) {
    return {
      success: false,
      output: '',
      error: parseResult.error,
    };
  }

  try {
    const formatted = JSON.stringify(parseResult.data, null, indent);
    return { success: true, output: formatted };
  } catch (e) {
    return {
      success: false,
      output: '',
      error: { message: '格式化失败' },
    };
  }
}

/**
 * 压缩 JSON（移除空白）
 */
export function minifyJSON(input: string): FormatResult {
  const parseResult = parseJSON(input);

  if (!parseResult.success) {
    return {
      success: false,
      output: '',
      error: parseResult.error,
    };
  }

  try {
    const minified = JSON.stringify(parseResult.data);
    return { success: true, output: minified };
  } catch (e) {
    return {
      success: false,
      output: '',
      error: { message: '压缩失败' },
    };
  }
}

/**
 * 验证 JSON 是否有效
 */
export function validateJSON(input: string): JSONParseResult {
  return parseJSON(input);
}

/**
 * 生成错误位置高亮的 HTML
 */
export function highlightError(
  input: string,
  position?: number,
  line?: number
): { before: string; error: string; after: string } {
  if (position !== undefined && position >= 0) {
    const before = input.substring(0, position);
    const errorChar = input.substring(position, position + 1) || '⟵';
    const after = input.substring(position + 1);
    return { before, error: errorChar, after };
  }

  if (line !== undefined && line > 0) {
    const lines = input.split('\n');
    const errorLineIndex = Math.min(line - 1, lines.length - 1);

    const before = lines.slice(0, errorLineIndex).join('\n') + (errorLineIndex > 0 ? '\n' : '');
    const error = lines[errorLineIndex] || '';
    const after = (errorLineIndex < lines.length - 1 ? '\n' : '') + lines.slice(errorLineIndex + 1).join('\n');

    return { before, error, after };
  }

  return { before: input, error: '', after: '' };
}
