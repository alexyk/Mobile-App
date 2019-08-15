import { isArray } from "../utils";
import { cloneDeep } from "lodash";

export const INVALID_CHILD_AGE = -1;

/**
 * @param {Number} roomsCount How many rooms to generate
 */
export function prepareInitialRoomsWithChildrenData(roomsCount) {
  let childrenAgeValues = [];

  for (let i = 0; i < roomsCount; i++) {
    childrenAgeValues.push([]);
  }

  return childrenAgeValues;
}

/**
 * @param {Number} roomsCount How many rooms to prepare for
 * @param {Array} oldData The old array
 *
 *  @returns {Array} A new deep copy of array with removed/added items to match roomsCount
 */
export function increaseRoomsWithChildrenData(roomsCount, oldData) {
  let childrenAgeValues = cloneDeep(oldData);

  if (roomsCount < childrenAgeValues.length) {
    while (roomsCount < childrenAgeValues.length) {
      childrenAgeValues.pop();
    }
  } else {
    while (roomsCount > childrenAgeValues.length) {
      childrenAgeValues.push([]);
    }
  }

  return childrenAgeValues;
}

/**
 * Used for increasing/decreasing children per room
 * and getting from cache if available
 * @param {Number} roomIndex The room to prepare
 * @param {Number} count The length to reach
 * @param {Array} cached The cache to use
 */
export function modifyChildrenCountInRoom(roomIndex, count, cachedRooms) {
  let i = 0;

  // prepare result array (create if not created)
  let result = cloneDeep(cachedRooms);
  if (result[roomIndex] == null) {
    result[roomIndex] = [];
  }

  let currentRoom = result[roomIndex];
  // add the values
  while (i < count) {
    if (currentRoom[i] == null) {
      // has no cached value
      currentRoom[i] = INVALID_CHILD_AGE;
    }

    i++;
  }

  return result;
}

modifyChildAgeInRoom(roomIndex, childIndex, ageValue, cache) {
  let result = cloneDeep(cache);
  result[roomIndex][childIndex] = ageValue;
}

/**
 * Modifies cache to update it ONLY if length is below count
 * @param {Number} countOrArray 
 * @param {Array} cached 
 */
export function updateChildAgesCache(roomIndex, countOrArray, cachedRooms) {
  let cached = cachedRooms[roomIndex];

  
  if (isArray(countOrArray)) {
    const array = countOrArray;
    cachedRooms[roomIndex] = cloneDeep(array);
  } else {
    if (cached == null) {
      cached = [];
      cachedRooms[roomIndex] = cached;
    }
    const count = countOrArray;
    while (count > cached.length) {
      cached.push(INVALID_CHILD_AGE);
    }
  }
}
