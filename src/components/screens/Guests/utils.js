import { isArray } from "../utils";
import { cloneDeep } from "lodash";

export const INVALID_CHILD_AGE = -1;

/**
 * Updates count of rooms used for children age data
 * @param {Number} roomsCount How many rooms to prepare for
 * @param {Array} cachedRooms The old array of rooms of children (2d array)
 *
 *  @returns {Array} A new deep copy of array with removed/added items to match roomsCount
 */
export function modifyRoomsForChildrenData(roomsCount, cachedRooms) {
  let result = cloneDeep(cachedRooms);

  if (roomsCount < result.length) {
    while (roomsCount < result.length) {
      result.pop();
    }
  } else {
    while (roomsCount > result.length) {
      result.push([]);
    }
  }

  return result;
}

/**
 * Used for increasing/decreasing children per room
 * and getting from cache if available
 * @param {Number} roomIndex The room to prepare
 * @param {Number} count The length to reach
 * @param {Array} cached The cache to use
 */
export function modifyChildrenCountInRoom(roomIndex, count, cachedRooms) {
  // prepare result array (create if not created)
  let result = cloneDeep(cachedRooms);
  if (result[roomIndex] == null) {
    result[roomIndex] = [];
  }
  let currentRoom = result[roomIndex];
  let currentCount = currentRoom.length;

  // add or delete values
  if (count < currentCount) {
    // delete
    currentRoom.splice(count, currentCount - count);
  } else {
    // add
    for (let i=0; i < count; i++) {
      if (currentRoom[i] == null) {
        // has no cached value
        currentRoom[i] = INVALID_CHILD_AGE;
      }
    }
  }

  return result;
}


/**
 * Used to set age value (@ageValue) per child (@childIndex) in a certain room (@roomIndex)
 * @param {Number} roomIndex The room where the child is
 * @param {Number} childIndex The index of the child in the room array
 * @param {Number} ageValue What should be the value of the age set to
 * @param {Array} roomCache Rooms cache
 */
export function modifyChildAgeInRoom(roomIndex, childIndex, ageValue, roomCache) {
  let result = cloneDeep(roomCache);
  result[roomIndex][childIndex] = ageValue;

  return result;
}


/**
 * Modifies cache to update it ONLY if length is below count
 * @param {Array} newRooms The new value of the 2d array of rooms of children ages
 * @param {Array} cachedRooms The old cached value of same array
 */
export function updateChildAgesCache(roomIndex, newRooms, cachedRooms) {
  if (roomIndex == null) {
    // update all
    newRooms.forEach((item,index) => cachedRooms[index] = item);
  } else {
    if (cachedRooms == null) {
      cachedRooms = cloneDeep(newRooms);
    } else if (newRooms != null) {
      if (cachedRooms[roomIndex] == null) {
        cachedRooms[roomIndex] = [];
      }
      if (newRooms[roomIndex] == null) {
        newRooms = [];
      }
      
      let current = newRooms[roomIndex];
      let cached = cachedRooms[roomIndex];

      for (let i=0; i < current.length; i++) {
        cached[i] = current[i];
      }
    }
  }

  return cachedRooms;
}
