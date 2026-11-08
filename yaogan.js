/**
 * @param {string} s
 * @param {string} p
 * @return {number[]}
 */
// var findAnagrams = function(s, p) {
//     // 其实这个用KMP算法效率会更高
//     let pointerMap = new Map()
//     const map = new Map()
//     for(let i = 0; i < p.length; i++) {
//         let key = p[i]
//         const num = map.get(key) || 0
//         pointerMap.set(key, num + 1)
//         map.set(key, num + 1)
//     }
//     let result = []

//     for(let i=0 ; i < s.length; i++) {
//         let num = pointerMap.get(s[i]) || 0
//         num--
//         if(num === 0) {
//             pointerMap.delete(s[i])
//             if(pointerMap.size === 0) { // 说明匹配到了
//               result.push(i - p.length + 1)
//               i = i - p.length + 2
//             }
//         } else if(num < 0) { // 说明该字符不匹配
//           pointerMap = new Map(Array.from(map)) // 重置指针Map
//         }
//     }
//     return result
// };

// findAnagrams("cbaebabacd")

/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {boolean}
 */
var isPalindrome = function(head) {
    if(head.next === null) return true; 
    let prev_lastHeader = head
    let next_lastHeader = head.next
    while(next_lastHeader){
        next_lastHeader.prev = prev_lastHeader;
        next_lastHeader = next_lastHeader.next
        prev_lastHeader = prev_lastHeader.next
    }
    let flag = true
    while(prev_lastHeader !== head) {
        if(prev_lastHeader.val === head.val) {
            prev_lastHeader = prev_lastHeader.prev
            head = head.next
        } else {
            flag = false
            break
        }
    }
    return flag
};
function ListNode(val, next) {
  this.val = (val===undefined ? 0 : val)
  this.next = (next===undefined ? null : next)
}

const createChain(arr) {
  let head = {
    next: null
  }
  let pointer = head
  for(let i= 0; i < arr.length; i++) {
    pointer.next = new ListNode(arr[i])
    pointer = pointer.next
  }
  return head.next
}
console.log(isPalindrome(createChain([1,2,2,1])))