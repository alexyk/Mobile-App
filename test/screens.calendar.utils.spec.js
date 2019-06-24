import moment from 'moment'
import { log, printAny } from './common-test-utils'

import { createInitialCalendarData } from '../src/components/screens/Calendar/utils'


test('createInitialCalendarData', () => {
  const fStr = 'YYYY-MM-DD';
  const today = moment('2019-01-10', fStr).startOf('day');
  const month = today.clone();
  const checkin = today.clone().add(1,'day');
  const checkout = today.clone().add(2,'day').add(113,'millisecond');

  const res = createInitialCalendarData(month, checkin, checkout, today, fStr);
  const {markedDays,days} = res
  // log({markedDays,today,checkin,checkout,month:month.format('YYYY-MM')})
  // log({res})

  expect(markedDays)                  .toBeDefined();
  expect(markedDays['2019-01-11'])    .toBeDefined();
  expect(markedDays['2019-01-12'])    .toBeDefined();

  const keys = Object.keys(markedDays);
  expect(keys)                    .toBeDefined();
  expect(keys.length)             .toBeDefined();
  expect(keys.length)             .toEqual(3);
  // log({keys})
})


// test('', () => {
  
// })