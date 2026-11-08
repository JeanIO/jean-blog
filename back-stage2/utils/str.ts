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

/**
 * 从 HTML 内容中提取第一个 <blockquote> 标签内的纯文本作为博客简介。
 * content 存的是 markdown 渲染后的 HTML；没有 blockquote 时返回空串。
 * 截取上限与 DB 列宽（varchar(1000)）对齐，留出省略号余量。
 */
export function extractBlockquote(html: string, maxLength = 996): string {
  if (!html) return ""
  const match = html.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i)
  if (!match) return ""
  const text = match[1]
    // 去掉内部嵌套标签
    .replace(/<[^>]+>/g, " ")
    // 常见 HTML 实体还原
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    // 空白折叠
    .replace(/\s+/g, " ")
    .trim()

  if (!text) return ""
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}…`
}