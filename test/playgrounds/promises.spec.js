import { cloneDeep } from 'lodash'


// mock envirentment - see also functions after tests 
log = console.log;
let expected = '';
let emptyFunc = (name) => () => throw new Error(`[${name}] These functions should be defined by test case`)
let promise, subPromise, 
  onPromiseSuccess = emptyFunc, 
  onPromiseFail = emptyFunc,
  onSubPromiseSuccess = emptyFunc,
  onSubPromiseFail = emptyFunc;


describe('Test the outcomes of promises', () => {
  beforeAll: () => {
    onPromiseSuccess      = emptyFunc('onPromiseSuccess'), 
    onPromiseFail         = emptyFunc('onPromiseFail'),
    onSubPromiseSuccess   = emptyFunc('onSubPromiseSuccess'),
    onSubPromiseFail      = emptyFunc('onSubPromiseFail');
  };

  describe('normal promise', () => {
    it('resolves', async () => {
      promise = genPromise('resolve');

      expect.assertions(2);
      expect(promise)                             .toBeDefined();
      await expect(promise)     .resolves         .toEqual('resolving');
    })

    it('rejects', async () => {
      promise = genPromise('reject');

      expect.assertions(2);
      expect(promise)                             .toBeDefined();
      await expect(promise)     .rejects          .toEqual('rejecting');
    });

    it('throws an error', async () => {
      promise = genPromise('error');

      expect.assertions(2);
      expect(promise)                                               .toBeDefined();
      
      await promise.catch(error => expect(error.message)             .toEqual('promise error'))
      // await expect(promise)     .rejects          .toEqual('rejecting');
    })
  });

  // TODO: Finish unit test experiments with chained promises
  describe('nested promises', () => {
    describe('1 sub-promise', () => {
      it('main resolves, sub resolves',  () => {
        promise = genPromiseWithNested('resolve', 'resolve');

        expect.assertions(2);

        onPromiseSuccess = data => expect(data)     .toEqual('resolving');
        onSubPromiseSuccess = data => expect(data)  .toEqual('resolving');
        
        return promise
                .then(onPromiseSuccess)
                .catch(onPromiseFail)
                .then(onSubPromiseSuccess)
                .catch(onSubPromiseFail);
      });

      it('main throws, sub resolves',  () => {
        promise = genPromiseWithNested('error', 'resolve');
        onSubPromiseSuccess = (data) => {
          log(`success: data`, data)
          expect(data)                              .toBeUndefined();
        }
        onSubPromiseFail = (data) => {
          expect(data)                              .toBeDefined();
          expect(data.message)                      .toBeDefined();
          expect(data.message)                      .toEqual('promise error');
        }
        
        expect.assertions(3);
        
        return promise
                .then(onSubPromiseSuccess)
                .catch(onSubPromiseFail);
      });
    });
  });
});




// functions

/**
 * @type (String|Object) Could be type - one of 'resolve', 'reject', 'error' or an Object - then the Promise returns it
 * @subType (String|Object) Same as type, but for the sub-promise
 */
function genPromiseWithNested(type, subType) {
  return (
    new Promise((resolve, reject) => {
      switch (type) {
        case 'resolve':
          resolve(genPromise(subType));
          break;

        case 'reject':
          reject(genPromise(subType));
          break;

        case 'error':
          throw new Error('promise error');
          break;

        default:
          let objectToReturn = type;
          return cloneDeep(objectToReturn);
      }
    })
  )
};


/**
 * @type (String|Object) Could be type - one of 'resolve', 'reject', 'error' or an Object - then the Promise returns it
 */
function genPromise(type) {
  return (
    new Promise((resolve, reject) => {
      switch (type) {
        case 'resolve':
          resolve('resolving');
          break;

        case 'reject':
          reject('rejecting');
          break;

        case 'error':
          throw new Error('promise error');
          break;


        default:
          let objectToReturn = type;
          return cloneDeep(objectToReturn);
      }
    })
  )
};