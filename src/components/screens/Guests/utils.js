import { isArray } from "../utils";
import { clog } from "../../../config-debug";

export const INVALID_CHILD_AGE = -1;

/**
 * 
 * @param {Number} count The length to reach
 * @param {Array} cached The cache to use (if present)
 */
export function prepareChildrenAgeValue(count, cached) {
  let childrenAgeValues = [];

  clog(`childrenAgeValues prepare`, {count,cached})
  
  let i = 0;
  while (i < count) {
    let item = INVALID_CHILD_AGE;

    // if using cache
    if (cached[i]) {
      item = cached[i];
    }

    childrenAgeValues.push(item);
    i++;
  }

  return childrenAgeValues;
}

/**
 * Modifies cache to update it ONLY if length is below count
 * @param {Number} countOrArray 
 * @param {Array} cached 
 */
export function updateChildAgesCache(countOrArray, cached) {
  if (isArray(countOrArray)) {
    const array = countOrArray;
    array.forEach((item,index) => cached[index] = item);
  } else {
    const count = countOrArray;
    while (count > cached.length) {
      cached.push(INVALID_CHILD_AGE);
    }
  }
}
