import utils from '../src/services/utilities/stringUtilities'

test(`stringUtilities - subBeforeIndexOf`,() => {
  const res = utils.subBeforeIndexOf(
    'https://dev.locktrip.com/hotels/listings/6718?region=52612&currency=EUR&startDate=24/06/2019&endDate=25/06/2019&rooms=%5B%7B%22adults%22:2,%22children%22:%5B%5D%7D%5D',
    '&rooms=',
    7
  );

  expect(res)     .toEqual('https://dev.locktrip.com/hotels/listings/6718?region=52612&currency=EUR&startDate=24/06/2019&endDate=25/06/2019&rooms=')
})