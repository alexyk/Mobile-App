import {
  modifyChildrenCountInRoom, updateChildAgesCache,
  prepareInitialRoomsWithChildrenData, increaseRoomsWithChildrenData,
  INVALID_CHILD_AGE
} from '../../src/components/screens/Guests/utils';
import { cloneDeep } from 'lodash';
import { log } from '../common-test-utils'


describe('guests related functionalities', () => {
  const na = INVALID_CHILD_AGE;

  describe('children rooms data', () => {
    it('should create initial data', () => {
      let res = prepareInitialRoomsWithChildrenData(2);
      expect(res)           .toBeDefined();
      expect(res.length)    .toBe(2);
      expect(res)           .toEqual([[],[]]);
    });

    it('should update data', () => {
      let old = [[2,8],[]];

      // add items
      let res = increaseRoomsWithChildrenData(3, old);
      expect(res)           .toBeDefined()
      expect(res.length)    .toEqual(3)
      expect(res)           .toEqual([[2,8],[],[]])

      // delete items
      res = increaseRoomsWithChildrenData(1, old);
      expect(res)           .toBeDefined()
      expect(res.length)    .toEqual(1)
      expect(res)           .toEqual([[2,8]])

      // no change
      res = increaseRoomsWithChildrenData(1, [[]]);
      expect(res)           .toBeDefined()
      expect(res.length)    .toEqual(1)
      expect(res)           .toEqual([[]])
    });
  });

  describe('should create children age values, by given:', () => {
    it('count and no cache', () => {
      let res = modifyChildrenCountInRoom(0, 1, [[]]);
      expect(res)             .toBeDefined();
      expect(res.length)      .toEqual(1);
      expect(res)             .toEqual([[na]]);
    });

    it('count and cachedRooms (with length less than count)', () => {
      let cachedRooms = [[2,8]];
      res = modifyChildrenCountInRoom(0, 3, cachedRooms);
      expect(res)             .toBeDefined();
      expect(res.length)      .toEqual(3);
      expect(res)             .toEqual( [[2,8,na]] );

      res = modifyChildrenCountInRoom(0,2, cachedRooms);
      expect(res)             .toBeDefined();
      expect(res.length)      .toEqual(2);
      expect(res)             .toEqual( [[2,8]] );

    });

    it('count and cachedRooms', () => {
      let cachedRooms = [[2,8,na]];
      res = modifyChildrenCountInRoom(0, cachedRooms);
      expect(res)             .toBeDefined();
      expect(res.length)      .toEqual(0);

      res = modifyChildrenCountInRoom(1, cachedRooms);
      expect(res)             .toBeDefined();
      expect(res.length)      .toEqual(1);
      expect(res)             .toEqual( [[2]] );

      res = modifyChildrenCountInRoom(4, cachedRooms);
      expect(res)             .toBeDefined();
      expect(res.length)      .toEqual(4);
      expect(res)             .toEqual( [[2,8,na,na]] );

      res = modifyChildrenCountInRoom(3, cachedRooms);
      expect(res)             .toBeDefined();
      expect(res.length)      .toEqual(3);
      expect(res)             .toEqual( [[2,8,na]] );
    });
  })

  describe('should update children age values cachedRooms by given:', () => {
    it('count', () => {
      let cachedRooms = [[2,8,0]];

      updateChildAgesCache(0, 0, cachedRooms);
      expect(cachedRooms)             .toBeDefined();
      expect(cachedRooms)             .toEqual( [[2,8,0]] );

      updateChildAgesCache(0, 5, cachedRooms);
      expect(cachedRooms)             .toBeDefined();
      expect(cachedRooms)             .toEqual( [[2,8,0,na,na]] );
    });

    it('array of values', () => {
      let cachedRooms = [[2,8,0,0,0]];

      updateChildAgesCache(0, [8,7,12, 1], cachedRooms);
      expect(cachedRooms)             .toBeDefined();
      expect(cachedRooms)             .toEqual( [[8,7,12,1,0]] );


      updateChildAgesCache(0, null, cachedRooms);
      expect(cachedRooms)             .toBeDefined();
      expect(cachedRooms)             .toEqual( [[8,7,12,1,0]] );
    });

    test('when cachedRooms is null', () => {
      updateChildAgesCache(0, [8,7,12, 1], null);
      expect(cachedRooms)             .toBeDefined();
      expect(cachedRooms)             .toEqual( [[8,7,12,1,0]] );
    });

  });

  describe.only('buy use case', () => {
    describe('prepare with empty cache', () => {
      describe('should add 1 child', () => {
        let cache = [[]];
        let res;

        it('adds 1 child to room 1', () => {
          // adding 1 room
          res = modifyChildrenCountInRoom(0, 1, cache);
          expect(res)               .toBeDefined();
          log('res', res)
          expect(res.length)        .toEqual(1);
          expect(res[0])            .toBeDefined();
          expect(res[0].length)     .toEqual(1);
          expect(res)               .toEqual([[na]]);
        });

        it('checks cache - should not be modified', () => {
          // check cache to stay untec
          expect(cache)             .toBe(cache);
          expect(cache)             .toEqual([[]]);
        });

        it('updates cache', () => {
          // updating cache
          updateChildAgesCache(0, res[0], cache)
          expect(cache)             .toBe(cache);
          expect(cache)             .toEqual([[na]]);
        });
      });

      describe('should add 1 child to room 1', () => {
        let cache = [[]];
        let res;

        it('adds 1 more room - no children yet', () => {
          res = increaseRoomsWithChildrenData(2, cache);
          expect(res)         .toBeDefined();
          expect(res.length)  .toEqual(2);
          expect(res)         .toEqual([[],[]]);
        });

        it('should not change cache', () => {
          expect(cache)       .toBe(cache);
          expect(cache.length).toEqual(1);
          expect(cache)       .toEqual([[]]);
        });

        it('should update cache', () => {
          updateChildAgesCache(1, res[1], cache);
          expect(cache)       .toBe(cache);
          expect(cache.length).toEqual(2);
          expect(cache)       .toEqual([[],[]]);
        });
      });

      describe('should modify child 1 age of room 1', () => {
        let cache = [[]];
        let res;

        it('modify child 1 of room 1 age', () => {
          res = modifyChildrenCountInRoom(0, cache);
          expect(res)         .toBeDefined();
          expect(res.length)  .toEqual(2);
          expect(res)         .toEqual([[],[]]);
        });

        it('should not change cache', () => {
          expect(cache)       .toBe(cache);
          expect(cache.length).toEqual(1);
          expect(cache)       .toEqual([[]]);
        });

        it('should update cache', () => {
          updateChildAgesCache(1, res[1], cache);
          expect(cache)       .toBe(cache);
          expect(cache.length).toEqual(2);
          expect(cache)       .toEqual([[],[]]);
        });
      });
    });
  });

});