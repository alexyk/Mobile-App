import { cloneDeep } from 'lodash'

/**
 * //TODO:
 *    1. Remove debugger
 *
 */

// mock envireontment - see also functions after tests 
const log = console.log;
const l = console.log;
let expected = '';
let emptyFunc = (name) => () => throw new Error(`[${name}] These functions should be defined by test case`)
let promise, subPromise, 
  onPromiseSuccess = emptyFunc, 
  onPromiseFail = emptyFunc,
  onSubPromiseSuccess = emptyFunc,
  onSubPromiseFail = emptyFunc;




// -----  TESTS -----

describe.only('chained promises handling experiments', () => {
  it('rejecting with reject and reject2, with catch at different position', async () => {
    expect.assertions(1)

    const h1 = (resolve, reject) => {
      console.log('handle 1');
      new Promise((resolve2, reject2) => {
        setTimeout(() => {
          console.log('handle 2');

          expect (1)                                .toBe(1);

          return reject2('no2');
        }, 1000)
      });
    }
    const p1 = () => new Promise((resolve, reject) => {
      return h1(resolve, reject);
    });

    let caseNo = 4;
    swtich (caseNo) {
      case 1:
        return p1()
                .then()
                .catch(error => l(error))
      case 2:
        return p1()
                .then()
                .catch(error => l(error))
      case 3:
        return p1()
                .then()
                .then()
                .catch(error => l(error))
      case 4:
        return p1()
                .then()
                .catch(error => l(`level 1`, error))
                .then()
                .catch(error => l(`level 2`, error))
      case 5:
        return p1()
                .then()
                .then()
                .catch(error => l(error))
      case 6:
        return p1()
                .then()
                .then()
                .catch(error => l(error))
    }
  }
})



describe('Try service-layer models', () => {
  describe('current - August, 2019', () => {
    const generateModelAug2019 = (caseType) => new Promise((resolve, reject) => {
      debugger;
      switch (caseType) {
        case "resolve1":
          resolve('resolving in main');
          break;
        case "reject1":
          reject('rejecting in main');
          break;
        case "throw1":
          throw new Error('throwing in main');
          break;
      }


      // fetch imitation
      new Promise((resolve2,reject2) => {
        switch (caseType) {
          case "resolve2":
            resolve2('resolving in fetch')
            break;
          case "reject2":
            reject2('rejecting in fetch')
            break;
          case "throw2":
            throw new Error('throwing in fetch')
            break;
        }
      })
    })
    const e1 = (caseType) => (result) => {
      switch (caseType) {
        case 'resolve1':
          expect(result)        .toEqual('resolving in main')
          break;
      }
    }
    const c1 = (caseType) => (result) => {
      expect(result instanceof Error)     .toBeTruthy();
      switch (caseType) {
        case 'resolve1':
          expect(result)                  .toEqual('resolving in main')
          break;
      }
    }

    debugger
    expect.assertions(1);

    it('resolve 1', () => {
      generateModelAug2019('resolve1')
        .then(e1('resolve1'))
        .catch(c1('resolve1'))
    })
  });
})


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
      
      await promise.catch(error => expect(error.message)            .toEqual('promise error'))
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