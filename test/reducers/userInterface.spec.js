import configureMockStore from 'redux-mock-store';
import { setWalletData, setLoginDetails } from '../../src/redux/action/userInterface';
import { initialState } from '../../src/redux/reducers/userInterface';
import { WALLET_STATE } from '../../src/redux/enum';
import { Platform } from 'react-native';
import userInterfaceReducer from '../../src/redux/reducers/userInterface';
import { cloneDeep } from 'lodash';


// extra tools
const log = console.log; const l = log; l2=(a) => log(typeof(a));
const mockStore = configureMockStore([]);

/**
 * Creates a fresh copy of mock state
 */
function setReduxMock(mockState) {
  let store = mockStore(cloneDeep(mockState));
  let state = store.getState();
  let actions = store.getActions();
  let mockRedux = {store, actions, state};

  return mockRedux;
};


// tests
describe('userInterface reducer - wallet related', () => {
  beforeEach(() => {
    
  }) 
  afterEach(() => {

  }) 

  describe('setting wallet data with setWalletData', () => {
    it('should set loginDetails.locAddress - with saveWalletData', () => {
      let {store, actions, state} = setReduxMock(initialState);

      let { loginDetails, walletData } = state;

      // initial state checks
      expect(loginDetails.locAddress)       .toBeDefined();
      expect(loginDetails.locAddress)       .toEqual(null);
      expect(walletData)                    .toBeDefined();
      expect(walletData)                    .toEqual({
                                              "ethBalance": null,
                                              "locBalance": null,
                                              skipLOCAddressRequest: false,
                                              isFirstLoading: true,
                                              "walletState": WALLET_STATE.CHECKING
                                            });

      // applying reducer
      const newState = userInterfaceReducer(newState, setWalletData({
        locAddress: '0x987234abfe987324p98744',
        walletState: WALLET_STATE.LOADING
      }));


      // testing
      loginDetails = newState.loginDetails;
      walletData = newState.walletData;
      expect(state.walletData)    .not    .toBe(newState.walletData);
      expect(newState)                    .toBeDefined();
      expect(loginDetails)                .toBeDefined();
      expect(loginDetails.locAddress)     .toEqual('0x987234abfe987324p98744')
      expect(walletData)                  .toEqual({
                                            ethBalance: null,
                                            locBalance: null,
                                            skipLOCAddressRequest: false,
                                            isFirstLoading: true,
                                            walletState: WALLET_STATE.LOADING
                                          });
    });

    it('should set walletData.walletState - with setWalletData and empty initial state', () => {
      let {store, actions, state} = setReduxMock({});

      let { loginDetails, walletData } = state;

      // initial state checks
      expect(loginDetails)      .not      .toBeDefined();
      expect(walletData)        .not      .toBeDefined();

      // apply reducer
      state = userInterfaceReducer(state, setWalletData({walletState: WALLET_STATE.NONE}));

      // test
      expect(state)                       .toEqual({
                                            walletData: {
                                              walletState: WALLET_STATE.NONE
                                            }
                                          });
    });

    it('should throw TypeError and return same state - when setting loginDetails.locAddress with setWalletData on an empty initial state', () => {
      let {store, actions, state} = setReduxMock({});

      let { loginDetails, walletData } = state;

      // initial state checks
      expect(loginDetails)      .not      .toBeDefined();
      expect(walletData)        .not      .toBeDefined();

      // apply reducer and catching throwing an error
      expect(() => {
        state = userInterfaceReducer(state, setWalletData({locAddress: '0xfa8869eacb897a987987bf1831'}));
      }).toThrow(new TypeError("Cannot set property 'locAddress' of undefined"));

      // test
      expect(state)                       .toEqual({});
    });

    it('should set walletData.walletState & loginDetails.locAddress - with setLoginDetails and normal initial state', () => {
      let {store, actions, state} = setReduxMock(initialState);

      let { loginDetails, walletData } = state;

      // initial state checks
      expect(loginDetails.locAddress)       .toBeDefined();
      expect(loginDetails.locAddress)       .toEqual(null);
      expect(walletData)                    .toBeDefined();
      expect(walletData)                    .toEqual({
                                              "ethBalance": null,
                                              "locBalance": null,
                                              skipLOCAddressRequest: false,
                                              isFirstLoading: true,
                                              "walletState": WALLET_STATE.CHECKING
                                            });

      // applying reducer
      const newState = userInterfaceReducer(newState, setWalletData({
        walletState: WALLET_STATE.NONE,
        locAddress: '0x987234abfe987324p98744'
      }));


      // testing
      loginDetails = newState.loginDetails;
      walletData = newState.walletData;
      expect(newState)                    .toBeDefined();
      expect(loginDetails)                .toBeDefined();
      expect(loginDetails.locAddress)     .toEqual('0x987234abfe987324p98744')
      expect(walletData)                  .toEqual({
                                            "ethBalance": null,
                                            "locBalance": null,
                                            skipLOCAddressRequest: false,
                                            isFirstLoading: true,
                                            "walletState": WALLET_STATE.NONE
                                          });
    });
    
  });

  describe('setting skipLOCAddressRequest with setLoginDetails', () => {
    it('should set skipLOCAddressRequest to true - valid locAddress', () => {
      let {store, actions, state} = setReduxMock(initialState);

      let { loginDetails, walletData } = state;

      // initial state checks
      expect(loginDetails.locAddress)       .toBeDefined();
      expect(loginDetails.locAddress)       .toEqual(null);
      expect(walletData)                    .toBeDefined();
      expect(walletData)                    .toEqual({
                                              "ethBalance": null,
                                              "locBalance": null,
                                              skipLOCAddressRequest: false,
                                              isFirstLoading: true,
                                              "walletState": WALLET_STATE.CHECKING
                                            });
      
      // applying reducer
      state = userInterfaceReducer(state, setLoginDetails({
        locAddress: '0x987234abfe987324098723'
      }));


      // testing
      loginDetails = state.loginDetails;
      walletData = state.walletData;
      expect(state)                       .toBeDefined();
      expect(loginDetails)                .toBeDefined();
      expect(loginDetails.locAddress)     .toEqual('0x987234abfe987324098723')
      expect(walletData)                  .toEqual({
                                            "ethBalance": null,
                                            "locBalance": null,
                                            skipLOCAddressRequest: true,
                                            isFirstLoading: true,
                                            "walletState": WALLET_STATE.CHECKING
                                          });
      
    });

    it('should leave skipLOCAddressRequest as false - invalid locAddress', () => {
      let {store, actions, state} = setReduxMock(initialState);

      let { loginDetails, walletData } = state;

      // initial state checks
      expect(loginDetails.locAddress)       .toBeDefined();
      expect(loginDetails.locAddress)       .toEqual(null);
      expect(walletData)                    .toBeDefined();
      expect(walletData)                    .toEqual({
                                              "ethBalance": null,
                                              "locBalance": null,
                                              skipLOCAddressRequest: false,
                                              isFirstLoading: true,
                                              "walletState": WALLET_STATE.CHECKING
                                            });
      
      // applying reducer
      state = userInterfaceReducer(state, setLoginDetails({
        locAddress: -1
      }));


      // testing
      loginDetails = state.loginDetails;
      walletData = state.walletData;
      expect(state)                       .toBeDefined();
      expect(loginDetails)                .toBeDefined();
      expect(loginDetails.locAddress)     .toEqual(-1)
      expect(walletData)                  .toEqual({
                                            "ethBalance": null,
                                            "locBalance": null,
                                            skipLOCAddressRequest: false,
                                            isFirstLoading: true,
                                            "walletState": WALLET_STATE.CHECKING
                                          });
    });
  });


  describe('setting isFirstLoading with setWalletData', () => {
    it("should set isFirstLoading to false - after first walletState 'ready'", () => {
      let {store, actions, state} = setReduxMock(initialState);

      let { loginDetails, walletData } = state;

      // initial state checks
      expect(loginDetails.locAddress)       .toBeDefined();
      expect(loginDetails.locAddress)       .toEqual(null);
      expect(walletData)                    .toBeDefined();
      expect(walletData)                    .toEqual({
                                              "ethBalance": null,
                                              "locBalance": null,
                                              skipLOCAddressRequest: false,
                                              isFirstLoading: true,
                                              "walletState": WALLET_STATE.CHECKING
                                            });
      
      // applying reducer
      state = userInterfaceReducer(state, setWalletData({
        walletState: WALLET_STATE.READY,
        locBalance: 2983298,
        ethBalance: 37877,
        locAddress: '0x897234da6fbc896cc97632fa'
      }));


      // testing
      loginDetails = state.loginDetails;
      walletData = state.walletData;
      expect(state)                       .toBeDefined();
      expect(loginDetails)                .toBeDefined();
      expect(loginDetails.locAddress)     .toEqual('0x897234da6fbc896cc97632fa')
      expect(walletData)                  .toEqual({
                                            "ethBalance": 37877,
                                            "locBalance": 2983298,
                                            skipLOCAddressRequest: false,
                                            isFirstLoading: false,
                                            "walletState": WALLET_STATE.READY
                                          });
      
    });
  })


});