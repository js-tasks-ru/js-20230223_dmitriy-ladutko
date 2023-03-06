/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const comparator = getComparator(param);
  return [...arr].sort(comparator);
}

const getComparator = (orderParam) => {
  const orders = ['asc', 'desc'];
  if (orders.includes(orderParam)) {
    const collator = getCollator();
    const reversedComparator = (a, b) => collator.compare(b, a);
    return orderParam === orders[0] ? collator.compare : reversedComparator;
  }
  throw new Error(`There is no order parameter value "${orderParam}" in the following list:`, orders);
};

const getCollator = () => new Intl.Collator(
  ['ru', 'en'],
  {
    sensitivity: 'case',
    caseFirst: 'upper'
  }
);
