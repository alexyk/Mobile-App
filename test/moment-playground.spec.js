import moment from 'moment'
import {log as logd} from "./common-test-utils"

log = console.log;

test('moment-playground', () => {
  const varLocal = moment()
  const varUTC = moment().utc()

  const start = varLocal;
  const end = moment(varLocal).add(500,'days');
  const parsed = moment().utc()
  const diff = moment.duration(end.diff(start)).asDays();

  logd({
    local: varLocal.toString(),
    utc:varUTC.toString(),
    start:start.toString(),
    end:end.toString(),
    diff,
    className: start.constructor.name
  })
})