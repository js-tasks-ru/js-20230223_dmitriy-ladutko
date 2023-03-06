/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (isNaN(size)) {
    return string;
  }
  let result = '';
  if (size > 0) {
    let counter = 0;
    for (const symbol of string) {
      if (symbol === result.at(-1)) {
        if (counter > 0) {
          result = result.concat(symbol);
          --counter;
        }
      } else {
        result = result.concat(symbol);
        counter = size - 1;
      }
    }
  }
  return result;
}
