import { processError, wlog } from "../../../config-debug";

const MONTH_FORMAT = 'YYYY-MM';
var ids = {
  DAY_ID: 0,
  DAYS_ROW_ID: 0,
  MONTH_ID: 0
}
export function listItemKeyGen(prop, prefix) {
  let id = ids[prop];
  if (id == null) {
    if (prop == null) {
      wlog(`[Calendar::utils::listItemKeyGen] Name 'prop' is null - using 'NA' instead`)
      prop = 'NA';
    } else {
      wlog(`[Calendar::utils::listItemKeyGen] Name '${prop}' not found in ids - creating it`)
    }
    ids[prop] = 0;
  }
  
  id++;
  if (id == Number.MAX_VALUE) {
      id = 0;
  }
  ids[prop] = id;

  return `${prefix}_${id}`;
}

/**
 * Returns initial days data (calendarData:Array) and initial marked data (calendarMarkedDays:Object)
 * @param {moment} checkInDateMoment 
 * @param {moment} checkOutDateMoment 
 * @param {moment} today 
 * @param {moment} minDate 
 * @param {moment} maxDate 
 * @param {String} internalFormat 
 * @param {Object} extraData 
 */
export function generateInitialCalendarData(checkInDateMoment,checkOutDateMoment,today,minDate,maxDate,internalFormat,extraData=null) {
  let calendarData = [];
  let calendarMarkedDays = {};
  let calendarMonthsToUpdate = {};

  try {
      let current = minDate;

      while ( current.isSameOrBefore(maxDate) ) {
          const dateClone = current.clone();
          const {days, markedDays, monthsToUpdate} = createInitialCalendarData({},dateClone,checkInDateMoment,checkOutDateMoment,today,internalFormat)
          const asStr = dateClone.format(MONTH_FORMAT);
          const id = listItemKeyGen('MONTH_ID', 'month');
          let month = {
              id,
              days,
              date: dateClone,
              asStr
          };
          Object.assign(calendarMarkedDays,markedDays);
          Object.assign(calendarMonthsToUpdate,monthsToUpdate);
          calendarData.push(month);
          current.add(1, 'month');
        }
  } catch (error) {
      processError(`[Calendar::utils::generateInitialCalendarData] ${error.message}`,{error});
  }

  return {calendarData, calendarMarkedDays, calendarMonthsToUpdate};
}

/**
 * Returns markedData: {days: {...}, months: {...}}
 * Example result: {
*      days: {
              2019-06-03: {isValid: false},
              2019-06-04: {isValid: true, isStart: true ...},
              ...
       },
 *     months: {
              2019-06: true,
              2019-07: false, 
              ...
       }
 * }
 * @param {Object} oldMarked The previous result, returned by this function
 * @param {moment} minDate 
 * @param {moment} checkInDateMoment 
 * @param {moment} checkOutDateMoment 
 * @param {moment} today 
 * @param {String} internalFormat 
 */
export function updateMarkedCalendarData(oldMarked, minDate,checkInDateMoment,checkOutDateMoment,today,internalFormat) {
  let days = {};
  let months = {};
  const {days:oldDays, months: oldMonths} = oldMarked;
  
  let current = minDate.clone();
  let currentMonth = current.month();
  let daysDifference = (
    (checkInDateMoment == null && checkOutDateMoment == null)
      ? today.diff(minDate,'days') + 1 // clear calendar case
      :
        checkOutDateMoment.isValid()
        ? checkOutDateMoment.diff(minDate,'days')
        : (
            (checkInDateMoment.isValid() && !checkOutDateMoment.isValid())
              ? checkInDateMoment.diff(minDate,'days')
              : 0
        )
  );
  
  try {

    while (daysDifference >= 0) {
      const {marked: dayMarked} = calculateDayData(oldDays, current, checkInDateMoment, checkOutDateMoment, today, internalFormat, true);
      populateMarkedData(current, dayMarked, days, months);

      current.add(1,'day');
      daysDifference--;

      if (currentMonth != current.month()) {
        currentMonth = current.month();
      }
    }

  } catch (error) {
    processError(`[Calendar::utils::updateMarkedCalendarData: ${error.message}`, {error});
  }

  return {days,months};
}

/**
 * Returns an object {marked, days}
 *  - marked    the marked days of the current month
 *  - days      the initial days of the month (including 'isEmpty=true' days that are of next & previous months)
 * @param {moment} monthDate As extracted from today (it needs to be reset with moment method 'date(1)' in order to start with day 1) 
 * @param {moment} checkInDateMoment 
 * @param {moment} checkOutDateMoment 
 * @param {String} internalFormat 
 */
export function createInitialCalendarData(oldMarked, monthDate,checkInDateMoment,checkOutDateMoment,today,internalFormat) {
    // const now = Date.now()
    // console.time(`*** Calendar::utils::createInitialCalendarData ${now}`);
    let days;
    let markedDays = {};
    let monthsToUpdate = {};

    try {
      const month = monthDate.month();
      let current = monthDate.clone().date(1);
      let weekday = current.isoWeekday();

      // prepend empty days (of previous month)
      if (weekday === 7) {
          days = [];
      } else {
          days = new Array(weekday).fill({isEmpty: true});
      }

      // parse all days
      while (current.month() === month) {
        const {day: newDay, marked: dayMarked} = calculateDayData(oldMarked,current, checkInDateMoment, checkOutDateMoment, today, internalFormat);
        days.push(newDay);
        current.add(1, 'days');
        populateMarkedData(current, dayMarked, markedDays, monthsToUpdate);
      }

      current.subtract(1, 'days'); // go back to last day of current month

      // append remaining empty days (of next month)
      weekday = current.isoWeekday();
      if (weekday === 7) {
          days = days.concat(new Array(6).fill({isEmpty: true}));
      } else {
        days = days.concat(new Array(Math.abs(weekday - 6)).fill({isEmpty: true}));
      }
      
      // console.timeEnd(`*** Calendar::utils::createInitialCalendarData ${now}`);
    } catch (error) {
      processError(`[Calendar::utils::createInitialCalendarData] ${error.message}`,{error});
    }

    return {days, markedDays, monthsToUpdate};
}

/**
 * Returns an object:
 *  {
 *      marked: {asStr: String, data: Object},
 *      day:    {text:String, date:moment}
 *  }
 * @param {moment} date 
 * @param {moment} checkInDateMoment 
 * @param {moment} checkOutDateMoment 
 * @param {moment} today 
 * @param {String} internalFormat 
 * @param {Boolean}   onlyMarked 
 */
export function calculateDayData(oldMarked, date, checkInDateMoment, checkOutDateMoment, today, internalFormat, onlyMarked=false) {
    let result = {};
    let marked = null;
    
    const asStr = date.format(internalFormat);
    const isStart = (checkInDateMoment && date.isSame(checkInDateMoment));
    const isMid = (checkInDateMoment && date.isAfter(checkInDateMoment) && date.isBefore(checkOutDateMoment));
    const isEnd = (checkOutDateMoment && date.isSame(checkOutDateMoment));
    const isFocus = (isMid || isStart || isEnd);
    const isToday = date.isSame(today);
    const isValid = (date.isSameOrAfter(today));
    const isStartPart = (isStart && (checkOutDateMoment != null));
    const isMarked = (isStart || isMid || isEnd || isFocus || isStartPart || isToday);
    const old = (oldMarked ? oldMarked[asStr] : null);
    const shouldUpdate = (old == null || (old.isMarked != isMarked));

    if (isMarked || !isValid || shouldUpdate) {
      if (!isValid && !isMarked) {
          marked = {asStr, data: {isValid,isMarked,shouldUpdate}};
      } else {
          marked = {
            asStr,
            data: {
                isStart, isMid, isEnd, isStartPart,
                isToday, isValid, isFocus, isMarked, shouldUpdate
            }
          }
        }
    }

    if (onlyMarked) {
        result = {marked};
    } else {
        const id = listItemKeyGen('DAY_ID', 'day');
        const text = date.date().toString();
        const day = {
            id,
            text,
            asStr,
            date: date.clone(),
        };
        result = {marked, day};
    }

    return result;
}

/**
 * Used when looping days and calculating days data
 * Example usage in: updateMarkedCalendarData and createInitialCalendarData
 * @param {moment} dayMoment Current day
 * @param {Object} dayMarked Marked data for the current day
 * @param {Object} days A map of days marked in the form: {2019-06-01: {}..., ...}
 * @param {object} months A map of months marked in the form: {2019-06: true, ...}
 */
function populateMarkedData(dayMoment, dayMarked, days, months) {
  if (dayMarked) {
    days[dayMarked.asStr] = dayMarked.data;
    const monthAsStr = dayMoment.format(MONTH_FORMAT);
    if (dayMarked.data.shouldUpdate) {
      months[monthAsStr] = true;
    }
  }
}
