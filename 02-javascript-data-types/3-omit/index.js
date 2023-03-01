/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
    const composedObj = {};
    for (const field in obj) {
        if (Object.hasOwnProperty.call(obj, field) && !fields.includes(field)) {
            composedObj[field] = obj[field];
        }
    }
    return composedObj;
};
