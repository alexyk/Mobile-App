import { cloneDeep } from "lodash";
import { HOTEL_ROOM_LIMITS } from "../../../config-settings";

export const INVALID_CHILD_AGE = -1;

/**
 * Updates count of rooms used for children age data
 * @param {Number} roomsCount How many rooms to prepare for
 * @param {Array} ageValues The old array of rooms of children (2d array)
 * @param {Array} cachedAgeValues The cache of rooms of children (2d array)
 *
 *  @returns {Array} A new deep copy of array with removed/added items to match roomsCount
 */
export function modifyRoomsForChildrenData(roomsCount, oldRoomsCount, ageValues, cachedAgeValues) {
  let result = cloneDeep(ageValues);

  if (roomsCount < result.length) {
    while (roomsCount < result.length) {
      result.pop();
    }
  } else {
    while (roomsCount > result.length) {
      result.push([]);
    }
  }

  if (roomsCount > oldRoomsCount) {
    retrieveRoomFromCache(oldRoomsCount, 0, HOTEL_ROOM_LIMITS.MAX.CHILDREN_PER_ROOM, ageValues, cachedAgeValues)
  }

  return result;
}

/**
 * Used for increasing/decreasing children per room
 * and getting from cache if available
 * @param {Number} roomIndex The room to prepare
 * @param {Number} count The length to reach
 * @param {Array} ageValues The last values used
 * @param {Array} cachedAgeValues The cache to use if given
 */
export function modifyChildrenCountInRoom(roomIndex, count, ageValues, cachedAgeValues) {
  // prepare result array (create if not created)
  let result = cloneDeep(ageValues);
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

  retrieveRoomFromCache(roomIndex, 0, count, result, cachedAgeValues);

  return result;
}


/**
 * Used to set age value (@ageValue) per child (@childIndex) in a certain room (@roomIndex)
 * @param {Number} roomIndex The room where the child is
 * @param {Number} childIndex The index of the child in the room array
 * @param {Number} value What should be the value of the age set to
 * @param {Number} ageValues Old data of rooms
 * @param {Array} cachedRooms Rooms cache
 */
export function modifyChildAgeInRoom(roomIndex, childIndex, value, ageValues) {
  let result = cloneDeep(ageValues);
  result[roomIndex][childIndex] = value;

  return result;
}


/**
 * Modifies cache to update it ONLY if length is below count
 * @param {Array} ageValues The new value of the 2d array of rooms of children ages
 * @param {Array} cachedAgeValues The cached values
 */
export function updateChildAgesCache(roomIndex, ageValues, cachedAgeValues) {
  if (roomIndex == null) {
    // update all
    ageValues.forEach((item,index) => cachedAgeValues[index] = item);
  } else {
    if (cachedAgeValues == null) {
      cachedAgeValues = cloneDeep(ageValues);
    } else if (ageValues != null) {
      if (cachedAgeValues[roomIndex] == null) {
        cachedAgeValues[roomIndex] = [];
      }
      if (ageValues[roomIndex] == null) {
        ageValues = [];
      }
      
      let current = ageValues[roomIndex];
      let cached = cachedAgeValues[roomIndex];

      for (let i=0; i < current.length; i++) {
        cached[i] = current[i];
      }
    }
  }

  return cachedAgeValues;
}


function retrieveRoomFromCache(roomIndex, startIndex, count, ageValues, cachedAgeValues) {
  let currentRoom = ageValues[roomIndex];
  if (currentRoom == null) {
    currentRoom = [];
  }

  let cachedRoom = cachedAgeValues[roomIndex];
  if (cachedRoom == null) {
    cachedRoom = [];
  }

  // retrieve values from cache

  for (let i=startIndex; i < count; i++) {
    const fromCache = cachedRoom[i];
    if (fromCache != null) {
      currentRoom[i] = fromCache;
    } else {
      break;
    }
  }

  return currentRoom;
}


export function calculateChildrenCount(ageValues) {
  // Since children are set per room - the count of all children (newValue) is the sum of count in all rooms
  // So for example a newAgeValues of [ [8,0,1], [10,14,3,5] ] would be 7 (3 children in room 1, and 4 in room 2)
  // (wasn't like this before - children were just one number)
  let result = 0;
  ageValues.forEach(item => result += item.length);

  return result;
}