import { processError, wlog } from "../../../utils/debug/debug-tools";
import { I18N_MAP } from "./i18n";
import { generateListItemKey } from "../HotelsSearch/utils";

const MONTH_FORMAT = "YYYY-MM";

/**
 * Returns initial days data (calendarData:Array) and initial marked data (calendarMarkedDays:Object)
 * @param {moment} checkInMoment
 * @param {moment} checkOutMoment
 * @param {moment} today
 * @param {moment} minDate
 * @param {moment} maxDate
 * @param {String} internalFormat
 * @param {Object} extraData
 */
export function generateInitialCalendarData(
  checkInMoment,
  checkOutMoment,
  today,
  minDate,
  maxDate,
  internalFormat
) {
  let calendarData = [];
  let calendarMarkedDays = {};
  let calendarMarkedMonths = {};

  try {
    let current = minDate.clone();

    while (current.isSameOrBefore(maxDate)) {
      const dateClone = current.clone();
      const { days, markedDays, markedMonths } = createInitialCalendarData(
        {},
        dateClone,
        checkInMoment,
        checkOutMoment,
        today,
        internalFormat
      );
      const asStr = dateClone.format(MONTH_FORMAT);
      const id = generateListItemKey("MONTH_ID", "month");
      let month = {
        id,
        days,
        date: dateClone,
        asStr
      };
      Object.assign(calendarMarkedDays, markedDays);
      Object.assign(calendarMarkedMonths, markedMonths);
      calendarData.push(month);
      current.add(1, "month");
    }
  } catch (error) {
    processError(
      `[Calendar::utils::generateInitialCalendarData] ${error.message}`,
      { error }
    );
  }

  return { calendarData, calendarMarkedDays, calendarMarkedMonths };
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
 * @param {Object} oldMarkedDays The previous result, returned by this function
 * @param {moment} minMoment Optimized refresh range - start date
 * @param {moment} maxMoment Optimized refresh range - end date
 * @param {moment} checkInMoment 
 * @param {moment} checkOutMoment 
 * @param {moment} today 
 * @param {String} internalFormat 
 */
export function updateMarkedCalendarData(
  oldMarkedDays,
  minMoment,
  maxMoment,
  checkInMoment,
  checkOutMoment,
  today,
  internalFormat
) {
  let days = {};
  let months = {};

  let current = minMoment.clone();
  let currentMonth = current.month();
  let daysDifference = maxMoment.diff(minMoment, "days");

  try {
    while (daysDifference >= 0) {
      const { marked: dayMarked } = calculateDayData(
        oldMarkedDays,
        current,
        checkInMoment,
        checkOutMoment,
        today,
        internalFormat,
        true
      );
      populateMarkedData(current, dayMarked, days, months);

      current.add(1, "day");
      daysDifference--;

      if (currentMonth != current.month()) {
        currentMonth = current.month();
      }
    }
    // add today
    current = today.clone();
    const { marked: dayMarked } = calculateDayData(
      oldMarkedDays,
      current,
      checkInMoment,
      checkOutMoment,
      today,
      internalFormat,
      true
    );
    populateMarkedData(current, dayMarked, days, months);

    // ilog('[updateMarkedCalendarData]',{minMoment,maxMoment,days,months,oldMarkedDays,checkInMoment,checkOutMoment,today,current});
  } catch (error) {
    processError(
      `[Calendar::utils::updateMarkedCalendarData: ${error.message}`,
      { error }
    );
  }

  return { days, months };
}

/**
 * Returns an object {marked, days}
 *  - marked    the marked days of the current month
 *  - days      the initial days of the month (including 'isEmpty=true' days that are of next & previous months)
 * @param {moment} monthDate As extracted from today (it needs to be reset with moment method 'date(1)' in order to start with day 1)
 * @param {moment} checkInMoment
 * @param {moment} checkOutMoment
 * @param {String} internalFormat
 */
export function createInitialCalendarData(
  oldMarkedDays,
  monthDate,
  checkInMoment,
  checkOutMoment,
  today,
  internalFormat
) {
  // const now = Date.now()
  // console.time(`*** Calendar::utils::createInitialCalendarData ${now}`);
  let days;
  let markedDays = {};
  let markedMonths = {};

  try {
    const month = monthDate.month();
    let current = monthDate.clone().date(1);
    let weekday = current.isoWeekday();

    // prepend empty days (of previous month)
    if (weekday === 7) {
      days = [];
    } else {
      days = new Array(weekday).fill({ isEmpty: true });
    }

    // parse all days
    let isMarked = false;
    while (current.month() === month) {
      const { day: newDay, marked: dayMarked } = calculateDayData(
        oldMarkedDays,
        current,
        checkInMoment,
        checkOutMoment,
        today,
        internalFormat
      );
      days.push(newDay);

      if (!isMarked) {
        const monthAsStr = current.format(MONTH_FORMAT);
        markedMonths[monthAsStr] = true;
        isMarked = true;
      }

      current.add(1, "days");
      populateMarkedData(current, dayMarked, markedDays, markedMonths);
    }

    current.subtract(1, "days"); // go back to last day of current month

    // append remaining empty days (of next month)
    weekday = current.isoWeekday();
    if (weekday === 7) {
      days = days.concat(new Array(6).fill({ isEmpty: true }));
    } else {
      days = days.concat(
        new Array(Math.abs(weekday - 6)).fill({ isEmpty: true })
      );
    }

    // console.timeEnd(`*** Calendar::utils::createInitialCalendarData ${now}`);
  } catch (error) {
    processError(
      `[Calendar::utils::createInitialCalendarData] ${error.message}`,
      { error }
    );
  }

  return { days, markedDays, markedMonths };
}

function calculateDayPropsAndFlags(
  date,
  oldMarkedDays,
  internalFormat,
  checkInMoment,
  checkOutMoment,
  today
) {
  const asStr = date.format(internalFormat);
  const isStart = checkInMoment && date.isSame(checkInMoment);
  const isMid =
    checkInMoment &&
    date.isAfter(checkInMoment) &&
    date.isBefore(checkOutMoment);
  const isEnd = checkOutMoment && date.isSame(checkOutMoment);
  const isFocus = isMid || isStart || isEnd;
  const isToday = date.isSame(today);
  const isValid = date.isSameOrAfter(today);
  const isStartPart = isStart && checkOutMoment != null;
  const isMarked =
    isStart || isMid || isEnd || isFocus || isStartPart || isToday;
  const old = oldMarkedDays ? oldMarkedDays[asStr] : null;
  const shouldUpdate = old == null || old.isMarked != isMarked || isToday;

  return {
    asStr,
    isStart,
    isMid,
    isEnd,
    isFocus,
    isToday,
    isValid,
    isStartPart,
    isMarked,
    shouldUpdate,
    old
  };
}

/**
 * Returns an object:
 *  {
 *      marked: {asStr: String, data: Object},
 *      day:    {text:String, date:moment}
 *  }
 * @param {moment} date
 * @param {moment} checkInMoment
 * @param {moment} checkOutMoment
 * @param {moment} today
 * @param {String} internalFormat
 * @param {Boolean}   onlyMarked
 */
export function calculateDayData(
  oldMarkedDays,
  date,
  checkInMoment,
  checkOutMoment,
  today,
  internalFormat,
  onlyMarked = false
) {
  let result = {};
  let marked = null;

  const {
    asStr,
    isStart,
    isMid,
    isEnd,
    isFocus,
    isToday,
    isValid,
    isStartPart,
    isMarked,
    shouldUpdate
  } = calculateDayPropsAndFlags(
    date,
    oldMarkedDays,
    internalFormat,
    checkInMoment,
    checkOutMoment,
    today
  );

  if (isMarked || !isValid || shouldUpdate) {
    if (!isValid && !isMarked) {
      marked = { asStr, data: { isValid, isMarked, shouldUpdate } };
    } else {
      marked = {
        asStr,
        data: {
          isStart,
          isMid,
          isEnd,
          isStartPart,
          isToday,
          isValid,
          isFocus,
          isMarked,
          shouldUpdate
        }
      };
    }
  }

  if (onlyMarked) {
    result = { marked };
  } else {
    const id = generateListItemKey("DAY_ID", "day");
    const text = date.date().toString();
    const day = {
      id,
      text,
      asStr,
      date: date.clone()
    };
    result = { marked, day };
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
  try {
    if (dayMarked) {
      days[dayMarked.asStr] = dayMarked.data;
      const monthAsStr = dayMoment.format(MONTH_FORMAT);
      if (dayMarked.data.shouldUpdate) {
        months[monthAsStr] = true;
      }
    }
  } catch (error) {
    processError(`[Calendar::utils::populateMarkedData] ${error.message}`, {
      error
    });
  }
}

export function i18n(compareYear, data, type) {
  try {
    const i18n = "en";
    const customI18n = {};
    if (~["w", "weekday", "text"].indexOf(type)) {
      // eslint-disable-line
      return (customI18n[type] || {})[data] || I18N_MAP[i18n][type][data];
    }
    if (type === "date") {
      const y = compareYear;
      let displayDateFormat = customI18n[type] || I18N_MAP[i18n][type];
      const year = data.year();

      // if date is next year
      if (compareYear < year) {
        displayDateFormat = "DD MMM, YYYY";
      }
      const result = data.format(displayDateFormat);

      return result;
    }
  } catch (error) {
    processError(`[Calendar::i18n] ${error.message}`, { error, type, data });
  }

  return {};
}

export function formatDatesData(
  compareYear,
  startMoment,
  endMoment,
  inputFormat
) {
  let result = {
    checkInMoment: startMoment,
    checkOutMoment: endMoment,
    checkInDateFormated: startMoment.format(inputFormat),
    checkOutDateFormated: endMoment.format(inputFormat),
    ...formatDay(compareYear, startMoment, inputFormat, true),
    ...formatDay(compareYear, endMoment, inputFormat, false)
  };

  return result;
}

export function formatDay(year, dayAsMoment, inputFormat, isStart) {
  const dayAsI18Str = i18n(year, dayAsMoment, "date");
  const dayAsI18WeekDayStr = i18n(year, dayAsMoment.isoWeekday(), "w");

  let result;
  if (isStart) {
    result = {
      startDate: dayAsMoment.format(inputFormat),
      startDateText: dayAsI18Str,
      startWeekdayText: dayAsI18WeekDayStr
    };
  } else {
    result = {
      endDate: dayAsMoment.format(inputFormat),
      endDateText: dayAsI18Str,
      endWeekdayText: dayAsI18WeekDayStr
    };
  }

  return result;
}
