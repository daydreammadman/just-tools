/**
 * 字数统计结果接口
 */
export interface WordCountResult {
  characters: number;        // 总字符数（含空格）
  charactersNoSpaces: number; // 字符数（不含空格）
  words: number;             // 英文单词数
  chineseChars: number;      // 中文字符数
  lines: number;             // 行数
  paragraphs: number;        // 段落数
  sentences: number;         // 句子数
}

/**
 * 统计文本字数
 * @param text - 输入文本
 * @returns 统计结果
 */
export function countWords(text: string): WordCountResult {
  if (!text) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      chineseChars: 0,
      lines: 0,
      paragraphs: 0,
      sentences: 0,
    };
  }

  // 总字符数（含空格）
  const characters = text.length;

  // 字符数（不含空格）
  const charactersNoSpaces = text.replace(/\s/g, '').length;

  // 中文字符数
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;

  // 英文单词数（匹配连续的英文字母）
  const words = (text.match(/[a-zA-Z]+/g) || []).length;

  // 行数
  const lines = text ? text.split('\n').length : 0;

  // 段落数（以空行分隔）
  const paragraphs = text
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0).length || (text.trim() ? 1 : 0);

  // 句子数（以句号、问号、感叹号结尾）
  const sentences = (text.match(/[.!?。！？]+/g) || []).length ||
    (text.trim() ? 1 : 0);

  return {
    characters,
    charactersNoSpaces,
    words,
    chineseChars,
    lines,
    paragraphs,
    sentences,
  };
}

/**
 * 估算阅读时间（分钟）
 * @param chineseChars - 中文字符数
 * @param englishWords - 英文单词数
 * @returns 预计阅读时间（分钟）
 */
export function estimateReadingTime(chineseChars: number, englishWords: number): number {
  // 中文阅读速度：约 400 字/分钟
  // 英文阅读速度：约 200 词/分钟
  const chineseTime = chineseChars / 400;
  const englishTime = englishWords / 200;
  const totalMinutes = chineseTime + englishTime;

  return Math.max(1, Math.ceil(totalMinutes));
}
