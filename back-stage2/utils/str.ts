export function getStrCharCount(str: string): number {
  if (typeof str !== "string") {
    return 0
  }
  return Array.from(str || "").length
}

/**
 * 从斜杠分隔的字符串中提取数字
 * @param str - 包含斜杠和数字的字符串
 * @returns 提取的数字数组
 *
 * 示例：
 * extractNumbersFromSlash('8/0/24') => [8, 0, 24]
 * extractNumbersFromSlash('/9/0/3/') => [9, 0, 3]
 * extractNumbersFromSlash('1/2/3/4') => [1, 2, 3, 4]
 */
export function extractNumbersFromSlash(str: string): number[] {
  if (typeof str !== "string") {
    return []
  }

  const matches = str.match(/\d+/g)

  return matches ? matches.map(Number) : []
}