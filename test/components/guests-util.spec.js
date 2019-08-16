import {
  modifyChildrenCountInRoom, modifyChildAgeInRoom, updateChildAgesCache,
  modifyRoomsForChildrenData,
  INVALID_CHILD_AGE
} from '../../src/components/screens/Guests/utils';
import { cloneDeep } from 'lodash';
import { log } from '../common-test-utils'


describe('guests related functionalities', () => {
  const na = INVALID_CHILD_AGE;

  describe('by issue cases', () => {
    describe('adding rooms from cache after decreasing them', () => {
      const oldValues = [[na,1],[8,6],[11,17]];
      let cache = [[8,9],[7,8],[3,5]];
      let res;

      it('sets rooms from 3 to 2', () => {
        res = modifyRoomsForChildrenData(2, 3, oldValues, cache);
        expect(res)               .toBeDefined();
        expect(res.length)        .toEqual(2);
        expect(res)               .toEqual( [[na,1], [8,6]] );
      });

      it('updates cache', () => {
        let newCache = updateChildAgesCache(null, res, cache);
        expect(cache)             .toBeDefined();
        expect(newCache)          .toBe(cache);
        expect(cache.length)      .toEqual(3);
        expect(cache)             .toEqual( [[na,1],[8,6],[3,5]] );
      });

      it('modify a childs age - issue appeared', () => {
          res = modifyChildAgeInRoom(0, 0, 13, res);
          expect(res)             .toBeDefined();
          expect(res.length)      .toEqual(2);
          expect(res)             .toEqual( [[13,1],[8,6]] );
      });
    });
  });

  describe('buy use case', () => {

    describe('prepare with empty cache', () => {

      describe('should add 1 child', () => {
        let cache = [[]];
        let oldValues = [[]];
        let res;

        it('adds 1 child to room 1', () => {
          // adding 1 room
          res = modifyChildrenCountInRoom(0, 1, oldValues, cache);
          expect(res)               .toBeDefined();
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
          updateChildAgesCache(0, res, cache)
          expect(cache)             .toBe(cache);
          expect(cache)             .toEqual([[na]]);
        });
      });

      describe('should add 1 child to room 1', () => {
        let cache = [[]];
        let cacheTemp = cache;
        let res = [[]];

        it('adds 1 more room - no children yet', () => {
          res = modifyRoomsForChildrenData(2, 0, res, cacheTemp);
          expect(res)         .toBeDefined();
          expect(res.length)  .toEqual(2);
          expect(res)         .toEqual([[],[]]);
        });

        it('should not have changed cache', () => {
          expect(cache)       .toBe(cacheTemp);
          expect(cache.length).toEqual(1);
          expect(cache)       .toEqual([[]]);
        });

        it('should update cache', () => {
          let cacheRes = updateChildAgesCache(1, res, cache);
          expect(cacheRes)       .toBe(cache);
          expect(cacheRes.length).toEqual(2);
          expect(cacheRes)       .toEqual([[],[]]);
        });
      });

      describe('should modify child 1 age of room 1', () => {
        let cache = [[]];
        let oldValues = [[]];
        let res;

        it('modify child 1 of room 1 age', () => {
          res = modifyChildAgeInRoom(0, 0, 13, oldValues, cache);
          expect(res)             .toBeDefined();
          expect(res.length)      .toEqual(1);
          expect(res[0])          .toBeDefined();
          expect(res[0].length)   .toEqual(1);
          expect(res)             .toEqual([[13]]);
        });

        it('should not change cache', () => {
          expect(cache)           .toBe(cache);
          expect(cache.length)    .toEqual(1);
          expect(cache)           .toEqual([[]]);
        });

        it('should update cache', () => {
          updateChildAgesCache(0, res, cache);
          expect(cache)           .toBe(cache);
          expect(cache.length)    .toEqual(1);
          expect(cache)           .toEqual([[13]]);
        });
      });
    });

    test('updates all cache', () => {
      let cache = [[8,9,0],[1,4]];
      let newRooms = [[9,0]];

      let res = updateChildAgesCache(null, newRooms, cache);
      expect(res)           .toBe(cache);
      expect(cache.length)  .toEqual(2);
      // updates only room 1 (index 0)
      expect(cache)         .toEqual([[9,0],[1,4]]);
    });
  });


  describe('initial tests',() => {

    describe('children rooms data', () => {
      
      it('should update data', () => {
        let cached = [[2,8],[]];
        let oldData =  [[2,8],[]];
        let res;

        // add 1 new room
        res = modifyRoomsForChildrenData(3, 2, oldData, cached);
        expect(res)           .toBeDefined()
        expect(res.length)    .toEqual(3)
        expect(res)           .toEqual([[2,8],[],[]])

        // delete one room
        res = modifyRoomsForChildrenData(1, 2, oldData, cached);
        expect(res)           .toBeDefined()
        expect(res.length)    .toEqual(1)
        expect(res)           .toEqual([[2,8]])

        // no change
        res = modifyRoomsForChildrenData(1, 1, [[]], [[]]);
        expect(res)           .toBeDefined()
        expect(res.length)    .toEqual(1)
        expect(res)           .toEqual([[]])
      });
    });

    describe('should modify children age values, by given:', () => {
      it('count and no cache', () => {
        let cachedRooms = [[]];
        let oldValues = [[]];

        let res = modifyChildrenCountInRoom(0, 1, oldValues, cachedRooms);
        expect(res)             .toBeDefined();
        expect(res.length)      .toEqual(1);
        expect(res)             .toEqual([[na]]);
      });

      it('count and cache (with cache-length less than count)', () => {
        cachedRooms = [[2,8]];
        oldValues = [[2,8]];

        res = modifyChildrenCountInRoom(0, 3, oldValues, cachedRooms);
        expect(res)             .toBeDefined();
        expect(res.length)      .toEqual(1);
        expect(res[0])          .toBeDefined();
        expect(res[0].length)   .toEqual(3);
        expect(res)             .toEqual( [[2,8,na]] );

        res = modifyChildrenCountInRoom(0,2, oldValues, cachedRooms);
        expect(res)             .toBeDefined();
        expect(res.length)      .toEqual(1);
        expect(res[0])          .toBeDefined();
        expect(res[0].length)   .toEqual(2);
        expect(res)             .toEqual( [[2,8]] );

      });

      it('count and cache', () => {
        cachedRooms = [[2,8,na]];
        oldValues = [[2,8,na]];

        res = modifyChildrenCountInRoom(0, 0, oldValues, cachedRooms);
        expect(res)             .toBeDefined();
        expect(res.length)      .toEqual(1);
        expect(res[0])          .toBeDefined();
        expect(res[0].length)   .toEqual(0);
        expect(res)             .toEqual( [[]] );

        res = modifyChildrenCountInRoom(0, 1, oldValues, cachedRooms);
        expect(res)             .toBeDefined();
        expect(res.length)      .toEqual(1);
        expect(res[0])          .toBeDefined();
        expect(res[0].length)   .toEqual(1);
        expect(res)             .toEqual( [[2]] );

        res = modifyChildrenCountInRoom(0, 4, oldValues, cachedRooms);
        expect(res)             .toBeDefined();
        expect(res.length)      .toEqual(1);
        expect(res[0])          .toBeDefined();
        expect(res[0].length)   .toEqual(4);
        expect(res)             .toEqual( [[2,8,na,na]] );

        res = modifyChildrenCountInRoom(0, 3, oldValues, cachedRooms);
        expect(res)             .toBeDefined();
        expect(res.length)      .toEqual(1);
        expect(res[0])          .toBeDefined();
        expect(res[0].length)   .toEqual(3);
        expect(res)             .toEqual( [[2,8,na]] );
      });
    })

    describe('should update children age values cache by given:', () => {
      test('array of new values', () => {
        let cachedRooms = [[2,8,0,0,0]];

        updateChildAgesCache(0, [[8,7,12, 1]], cachedRooms);
        expect(cachedRooms)             .toBeDefined();
        expect(cachedRooms)             .toEqual( [[8,7,12,1,0]] );


        updateChildAgesCache(0, null, cachedRooms);
        expect(cachedRooms)             .toBeDefined();
        expect(cachedRooms)             .toEqual( [[8,7,12,1,0]] );
      });

      test('when cachedRooms is null', () => {
        let cache = updateChildAgesCache(0, [[8,7,12,1,0]], null);
        expect(cache)             .toBeDefined();
        expect(cache)             .toEqual( [[8,7,12,1,0]] );
      });

    });

  });

});