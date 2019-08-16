import {
  modifyChildrenCountInRoom, modifyChildAgeInRoom, updateChildAgesCache,
  modifyRoomsForChildrenData,
  INVALID_CHILD_AGE
} from '../../src/components/screens/Guests/utils';
import { cloneDeep } from 'lodash';
import { log } from '../common-test-utils'


describe('guests related functionalities', () => {
  const na = INVALID_CHILD_AGE;


  describe('buy use case', () => {

    describe('prepare with empty cache', () => {

      describe('should add 1 child', () => {
        let cache = [[]];
        let res;

        it('adds 1 child to room 1', () => {
          // adding 1 room
          res = modifyChildrenCountInRoom(0, 1, cache);
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
        let res;

        it('adds 1 more room - no children yet', () => {
          res = modifyRoomsForChildrenData(2, cache);
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
          updateChildAgesCache(1, res, cache);
          expect(cache)       .toBe(cache);
          expect(cache.length).toEqual(2);
          expect(cache)       .toEqual([[],[]]);
        });
      });

      describe('should modify child 1 age of room 1', () => {
        let cache = [[]];
        let res;

        it('modify child 1 of room 1 age', () => {
          res = modifyChildAgeInRoom(0, 0, 13, cache);
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
  });


  describe('initial tests',() => {

    describe('children rooms data', () => {
      
      it('should update data', () => {
        let cached = [[2,8],[]];

        // add items
        let res = modifyRoomsForChildrenData(3, cached);
        expect(res)           .toBeDefined()
        expect(res.length)    .toEqual(3)
        expect(res)           .toEqual([[2,8],[],[]])

        // delete items
        res = modifyRoomsForChildrenData(1, cached);
        expect(res)           .toBeDefined()
        expect(res.length)    .toEqual(1)
        expect(res)           .toEqual([[2,8]])

        // no change
        res = modifyRoomsForChildrenData(1, [[]]);
        expect(res)           .toBeDefined()
        expect(res.length)    .toEqual(1)
        expect(res)           .toEqual([[]])
      });
    });

    describe('should modify children age values, by given:', () => {
      it('count and no cache', () => {
        let cachedRooms = [[]];

        let res = modifyChildrenCountInRoom(0, 1, cachedRooms);
        expect(res)             .toBeDefined();
        expect(res.length)      .toEqual(1);
        expect(res)             .toEqual([[na]]);
      });

      it('count and cache (with cache-length less than count)', () => {
        let cachedRooms = [[2,8]];

        res = modifyChildrenCountInRoom(0, 3, cachedRooms);
        expect(res)             .toBeDefined();
        expect(res.length)      .toEqual(1);
        expect(res[0])          .toBeDefined();
        expect(res[0].length)   .toEqual(3);
        expect(res)             .toEqual( [[2,8,na]] );

        res = modifyChildrenCountInRoom(0,2, cachedRooms);
        expect(res)             .toBeDefined();
        expect(res.length)      .toEqual(1);
        expect(res[0])          .toBeDefined();
        expect(res[0].length)   .toEqual(2);
        expect(res)             .toEqual( [[2,8]] );

      });

      it('count and cache', () => {
        let cachedRooms = [[2,8,na]];

        debugger
        res = modifyChildrenCountInRoom(0, 0, cachedRooms);
        expect(res)             .toBeDefined();
        expect(res.length)      .toEqual(1);
        expect(res[0])          .toBeDefined();
        expect(res[0].length)   .toEqual(0);
        expect(res)             .toEqual( [[]] );

        res = modifyChildrenCountInRoom(0, 1, cachedRooms);
        expect(res)             .toBeDefined();
        expect(res.length)      .toEqual(1);
        expect(res[0])          .toBeDefined();
        expect(res[0].length)   .toEqual(1);
        expect(res)             .toEqual( [[2]] );

        res = modifyChildrenCountInRoom(0, 4, cachedRooms);
        expect(res)             .toBeDefined();
        expect(res.length)      .toEqual(1);
        expect(res[0])          .toBeDefined();
        expect(res[0].length)   .toEqual(4);
        expect(res)             .toEqual( [[2,8,na,na]] );

        res = modifyChildrenCountInRoom(0, 3, cachedRooms);
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
        expect(cachedRooms)             .toEqual( [[8,7,12,1]] );


        updateChildAgesCache(0, null, cachedRooms);
        expect(cachedRooms)             .toBeDefined();
        expect(cachedRooms)             .toEqual( [[8,7,12,1]] );
      });

      test('when cachedRooms is null', () => {
        let cache = updateChildAgesCache(0, [[8,7,12,1,0]], null);
        expect(cache)             .toBeDefined();
        expect(cache)             .toEqual( [[8,7,12,1,0]] );
      });

    });

  });

});