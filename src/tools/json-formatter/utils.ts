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
 * 预处理输入：提取有效的 JSON 内容
 * 1. 移除前导的无关文本（如 AI 回复中的说明文字）
 * 2. 移除 markdown 代码块标记（```json ... ```）
 * 3. 将字符串形式的转义序列转换为真实换行符
 * 4. 规范化换行符
 */
export function preprocessInput(input: string): string {
  if (!input) return input;

  let processed = input;

  // 1. 移除 markdown 代码块标记
  // 匹配 ```json 或 ``` 开头，``` 结尾的代码块
  processed = processed.replace(/^```(?:json|javascript|js)?\s*\n?/i, '');
  processed = processed.replace(/\n?```\s*$/i, '');

  // 2. 将字符串形式的 \n 转换为真实换行符
  // 但要小心，只转换那些真的是字符串字面量 "\n" 而不是实际的换行符
  // 检测是否包含字面量 \n（通过检查是否有连续的反斜杠和n）
  if (processed.includes('\\n')) {
    // 将 \\n 转换为实际的换行符
    processed = processed.replace(/\\n/g, '\n');
    // 同样处理其他转义字符
    processed = processed.replace(/\\r/g, '\r');
    processed = processed.replace(/\\t/g, '\t');
    processed = processed.replace(/\\"/g, '"');
    processed = processed.replace(/\\\\/g, '\\');
  }

  // 3. 规范化换行符：将 \r\n 和 \r 统一转换为 \n
  processed = processed.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 4. 查找第一个 JSON 起始字符的位置
  const jsonStartMatch = processed.match(/[{[]/);
  if (jsonStartMatch && jsonStartMatch.index !== undefined && jsonStartMatch.index > 0) {
    // 从第一个 { 或 [ 开始截取
    processed = processed.substring(jsonStartMatch.index);
  }

  // 5. 查找最后一个 JSON 结束字符的位置
  const jsonEndMatch = processed.match(/[}\]](?=[^}\]]*$)/);
  if (jsonEndMatch && jsonEndMatch.index !== undefined) {
    // 截取到最后一个 } 或 ] 结束
    processed = processed.substring(0, jsonEndMatch.index + 1);
  }

  return processed.trim();
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

  // 预处理输入
  const processedInput = preprocessInput(input);

  if (!processedInput) {
    return {
      success: false,
      error: { message: '未找到有效的 JSON 内容' },
    };
  }

  try {
    const data = JSON.parse(processedInput);
    return { success: true, data };
  } catch (e) {
    const error = e as SyntaxError;
    const errorInfo = extractErrorPosition(error.message, processedInput);

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
  } catch {
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
  } catch {
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
