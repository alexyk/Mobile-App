import moment from 'moment'
import { log, printAny } from './common-test-utils'
import {
  calculateDayData, createInitialCalendarData
} from '../src/components/screens/Calendar/utils'
import { internalFormat } from '../src/redux/reducers/userInterface'


describe('calendar data functions', () => {
  let today = moment.utc('2019-01-10', internalFormat);
  const month = today.clone();
  const checkin = today.clone().add(1,'day');
  const checkout = today.clone().add(2,'day').add(113,'millisecond');
  const oldMarkedDays = {
    ['2019-11-01']:{isValid: true},
    ['2019-11-02']:{isValid: true},
    ['2019-11-03']:{isValid: true},
  };

  it('calculateDayData', () => {
    let res = calculateDayData(oldMarkedDays, checkin, checkin, checkout, today, internalFormat);

    expect(res)             .toBeDefined();
    expect(res.marked)      .toBeDefined();
    expect(res.day)         .toBeDefined();
    expect(res.day.asStr)   .toEqual('2019-01-11');
  })

  it('createInitialCalendarData', () => {

    const res = createInitialCalendarData({}, month, checkin, checkout, today, internalFormat);
    const {markedDays,days} = res
    // log({markedDays,today,checkin,checkout,month:month.format('YYYY-MM')})
    // log({markedDays,month:month.format('YYYY-MM')})
    // log({res})

    expect(markedDays)                  .toBeDefined();
    expect(markedDays['2019-01-11'])    .toBeDefined();
    expect(markedDays['2019-01-12'])    .toBeDefined();

    const keys = Object.keys(markedDays);
    // log({keys})
    expect(keys)                    .toBeDefined();
    expect(keys.length)             .toBeDefined();
    expect(keys.length)             .toEqual(3);      // TODO: Investigate and fix - too much rendering? if 31
  })

})

// test('', () => {
  
// })