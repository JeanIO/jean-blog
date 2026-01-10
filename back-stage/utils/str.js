export function getStrCharCount(str) {
  if(typeof str !== 'string') {
    return 0;
  }
  return Array.from(str || '').length
}

/**
 * 从斜杠分隔的字符串中提取数字
 * @param {string} str - 包含斜杠和数字的字符串
 * @returns {number[]} - 提取的数字数组
 * 
 * 示例：
 * extractNumbersFromSlash('8/0/24') => [8, 0, 24]
 * extractNumbersFromSlash('/9/0/3/') => [9, 0, 3]
 * extractNumbersFromSlash('1/2/3/4') => [1, 2, 3, 4]
 */
export function extractNumbersFromSlash(str) {
  // 确保输入是字符串
  if (typeof str !== 'string') {
    return [];
  }
  
  // 使用正则表达式匹配所有数字
  const matches = str.match(/\d+/g);
  
  // 将匹配的字符串转换为数字数组
  return matches ? matches.map(Number) : [];
}
