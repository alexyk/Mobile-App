import { processError, ilog } from "../../../config-debug";

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

  try {
      let current = minDate;

      while ( current.isSameOrBefore(maxDate) ) {
          const dateClone = current.clone();
          const {days, marked} = createInitialCalendarData({},dateClone,checkInDateMoment,checkOutDateMoment,today,internalFormat)
          let month = {
              days,
              date: dateClone
          };
          Object.assign(calendarMarkedDays,marked);
          calendarData.push(month);
          current.add(1, 'month');
      }
  } catch (error) {
      processError(`[Calendar::utils::generateInitialCalendarData] ${error.message}`,{error});
  }

  return {calendarData, calendarMarkedDays};
}

export function updateMarkedCalendarData(oldMarked, minDate,checkInDateMoment,checkOutDateMoment,today,internalFormat) {
  let result = {};
  
  let current = minDate.clone();
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

      const {marked: dayMarked} = calculateDayData(oldMarked, current, checkInDateMoment, checkOutDateMoment, today, internalFormat, true);
      if (dayMarked) {
          result[dayMarked.asStr] = dayMarked.data;
      }

      current.add(1,'day');
      daysDifference--;
    }

  } catch (error) {
    processError(`[Calendar::utils::updateMarkedCalendarData: ${error.message}`, {error});
  }

  return result;
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

    const month = monthDate.month();

    let current = monthDate.clone().date(1);
    let weekday = current.isoWeekday();
    let days;
    let marked = {};

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
      if (dayMarked) {
          marked[dayMarked.asStr] = dayMarked.data;
      }
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

    return {days, marked};
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
    const old = oldMarked[asStr];
    const isDirty = (old && (old.isMarked != isMarked)) || false;
    if (isDirty) ilog(`${asStr} is dirty`);

    if (isMarked || !isValid) {
      if (!isValid && !isMarked) {
          marked = {asStr, data: {isValid,isMarked,isDirty}};
      } else {
          marked = {
            asStr,
            data: {
                isStart, isMid, isEnd, isStartPart,
                isToday, isValid, isFocus, isMarked, isDirty
            }
          }
        }
    }

    if (onlyMarked) {
        result = {marked};
    } else {
        const text = date.date().toString();
        const day = {
            text,
            asStr,
            date: date.clone(),
        };
        result = {marked, day};
    }

    return result;
}
