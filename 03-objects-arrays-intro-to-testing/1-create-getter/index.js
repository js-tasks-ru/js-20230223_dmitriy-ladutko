/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const properties = path.split(".");

  function getter(obj, propertyIndex = 0) {
    if (Object.keys(obj).includes(properties.at(propertyIndex))) {
      if (propertyIndex === properties.length - 1) {
        return obj[properties.at(-1)];
      }
      return getter(obj[properties.at(propertyIndex)], ++propertyIndex);
    }
  }

  return getter;
}
