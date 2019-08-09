import configureMockStore from 'redux-mock-store';
import { setWalletData, setDatesAndGuestsData } from '../../src/redux/action/userInterface';
import { initialState } from '../../src/redux/reducers/userInterface';
import { WALLET_STATE } from '../../src/redux/enum';
import { Platform } from 'react-native';
import userInterfaceReducer from '../../src/redux/reducers/userInterface';


// extra tools
const log = console.log; const l = log; l2=(a) => log(typeof(a));
const mockStore = configureMockStore([]);

const setReduxMock = (mockState) => {
  let store = mockStore(mockState);
  let state = store.getState();
  let actions = store.getActions();
  let mockRedux = {store, actions, state};

  return mockRedux;
};


// tests
describe('wallet redux cache (changes by userInterface reducer)', () => {
  beforeEach(() => {
    
  }) 
  afterEach(() => {

  }) 

  it('should set wallet data - with empty state', () => {
    let {store, actions, state} = setReduxMock({});

    state = userInterfaceReducer(state, setWalletData({walletState: WALLET_STATE.NONE}));
    // expect(state)    .toEqual({walletData: 'none'})
  });

  it('should set wallet data - with initial state', () => {
    let {store, actions, state} = setReduxMock(initialState);

    // initial state checks
    expect(state.loginDetails.locAddress)        .toBeDefined();
    expect(state.loginDetails.locAddress)        .toEqual(null);
    expect(state.walletData)              .toBeDefined();
    expect(state.walletData)              .toEqual({
                                            "ethBalance": null,
                                            "locBalance": null,
                                            "walletState": WALLET_STATE.CHECKING
                                          });

    // applying reducer
    state = userInterfaceReducer(state, setWalletData({
      walletState: WALLET_STATE.NONE,
      locAddress: '0x987234rnhu987324p98723'
    }));

    // testing
    expect(state)                       .toBeDefined();
    expect(state.loginDetails)                 .toBeDefined();
    expect(state.loginDetails.locAddress)      .toEqual('0x987234rnhu987324p98723')
    expect(state.walletData)            .toEqual({
                                          "ethBalance": null,
                                          "locBalance": null,
                                          "walletState": WALLET_STATE.NONE
                                        });
  });

});