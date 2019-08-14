import {
  prepareChildrenAgeValue, updateChildAgesCache
} from '../../src/components/screens/Guests/utils';


describe('guests related functionalities', () => {
  describe('should create children age values, by given:', () => {
    it('count and no cache', () => {
      let res = prepareChildrenAgeValue(1, []);
      expect(res)             .toBeDefined();
      expect(res.length)      .toEqual(1);
      expect(res)             .toEqual([-1]);
    });

    it('count and cached (with length less than count)', () => {
      let cached = [2,8];
      res = prepareChildrenAgeValue(3, cached);
      expect(res)             .toBeDefined();
      expect(res.length)      .toEqual(3);
      expect(res)             .toEqual( [2,8,-1] );

      res = prepareChildrenAgeValue(2, cached);
      expect(res)             .toBeDefined();
      expect(res.length)      .toEqual(2);

    });

    it('count and cached', () => {
      let cached = [2,8,-1];
      res = prepareChildrenAgeValue(0, cached);
      expect(res)             .toBeDefined();
      expect(res.length)      .toEqual(0);

      res = prepareChildrenAgeValue(1, cached);
      expect(res)             .toBeDefined();
      expect(res.length)      .toEqual(1);
      expect(res)             .toEqual( [2] );

      res = prepareChildrenAgeValue(4, cached);
      expect(res)             .toBeDefined();
      expect(res.length)      .toEqual(4);
      expect(res)             .toEqual( [2,8,-1,-1] );

      res = prepareChildrenAgeValue(3, cached);
      expect(res)             .toBeDefined();
      expect(res.length)      .toEqual(3);
      expect(res)             .toEqual( [2,8,-1] );

    });
  })

  describe('should update children age values cached by given:', () => {
    it('count', () => {
      let cached = [2,8,0];

      updateChildAgesCache(0, cached);
      expect(cached)             .toBeDefined();
      expect(cached)             .toEqual( [2,8,0] );

      updateChildAgesCache(5, cached);
      expect(cached)             .toBeDefined();
      expect(cached)             .toEqual( [2,8,0,-1,-1] );
    });

    it('array of values', () => {
      let cached = [2,8,0,0,0];

      updateChildAgesCache([8,7,12, 1], cached);
      expect(cached)             .toBeDefined();
      expect(cached)             .toEqual( [8,7,12,1,0] );


      updateChildAgesCache(null, cached);
      expect(cached)             .toBeDefined();
      expect(cached)             .toEqual( [8,7,12,1,0] );
    });
  });

});