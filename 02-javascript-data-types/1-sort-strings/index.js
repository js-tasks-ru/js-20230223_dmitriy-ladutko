/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    const orders = ['asc', 'desc'];
    if (orders.includes(param)) {
        const cloneArr = [...arr];
        const collator = new Intl.Collator(
            ['ru', 'en'],
            {
                sensitivity: 'case',
                caseFirst: 'upper'
            }
        );
        cloneArr.sort((a, b) => collator.compare(a, b));
        return param === 'asc' ? cloneArr : cloneArr.reverse();
    } else {
        console.error(`There is no order parameter value "${param}" in the following list:`, orders);
        return null;
    }
}
