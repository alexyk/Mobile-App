import moment from 'moment'

import {log} from "../common-test-utils"
let l=console.log

logd1 = (obj) => {
  let res = {}
  for (let p in obj) {
    const item = obj[p];
    if (item._isAMomentObject) {
      res[p] = item.toString();
    } else {
      res[p] = item;
    }
  }
  log(res)
}

describe('moment experiments', () => {

  it('moment-playground', () => {
    const varLocal = moment()
    const varUTC = moment().utc()

    const start = varLocal;
    const end = moment(varLocal).add(500,'days');
    const parsed = moment().utc()
    const diff = moment.duration(end.diff(start)).asDays();

    log({
      local: varLocal.toString(),
      utc:varUTC.toString(),
      start:start.toString(),
      end:end.toString(),
      diff,
      className: start.constructor.name
    })
  });

  it('moment-isBetween',() => {
    const now = moment();
    const start = now.clone();
    const end = now.clone().add(100,'d');
    const current1 = start.clone();
    const current1_1 = start.clone().add(1,'ms');
    const current2 = now.clone().add(3);
    const current3 = end.clone();
    const current3_1 = end.clone().subtract(1,'ms');

    logd1({now,start,end,current1,current1_1,current2,current3,
      isBetween1:current1.isBetween(start,end),
      isBetween1_1:current1_1.isBetween(start,end),
      isBetween2:current2.isBetween(start,end),
      isBetween3:current3.isBetween(start,end),
      isBetween3_1:current3_1.isBetween(start,end),
    })

    log(now.format('YYYY-MM-DD'))
    // Conclusion - at least 1ms is needed to make the difference
    // So it is not inBetweenOrEqual - it is inBetweenButNotEqual
  });

  it.only('moment unix', () => {
    const date1 = '25/10/1990';
    const format = 'DD/MM/YYYY';
    let m1 = moment(date1,format);
    l(date1, 'format:', m1.format('DD/MM/YYYY'))
    l(date1, 'unix:', m1.unix())
    l(date1, 'fromNow:', m1.fromNow())

    const date2 = '10/10/1960';
    l(date2, 'unix:', moment(date2, format).unix());
  })
});