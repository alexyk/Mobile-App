import { handleActions } from 'redux-actions';
import {
  setIsApplyingFilter, setDatesAndGuestsData, setWebViewURL, setLoginDetails, setWalletData
} from '../../action/userInterface';

import moment from 'moment'
import lodash, {cloneDeep} from 'lodash';

import { generateInitialCalendarData, formatDatesData } from '../../../components/screens/Calendar/utils';
import { stringifyRoomsData } from '../../../components/screens/utils';
import { WALLET_STATE } from '../../enum'
import { validateLOCAddress } from '../../../utils/validation';


export const internalFormat = "YYYY-MM-DD";
export const inputDateFormat = 'DD/MM/YYYY';
export const displayDateFormat = 'ddd, DD MMM';
const today = moment().startOf('day');
const checkInMoment = today.clone().add(1, 'day');
const checkOutMoment = today.clone().add(2, 'day');
const minDate = today.clone();
const maxDate = today.clone().add(12, 'months').startOf('day');
const minValid = minDate.isValid();
const maxValid = maxDate.isValid();
if (!maxValid && minValid) {
    maxDate = this.minDate.add(12, 'months');
}
if (maxValid && !minValid) {
    minDate = maxDate.subtract(12, 'months');
}
const {
  calendarData, calendarMarkedDays, calendarMarkedMonths
} = generateInitialCalendarData(checkInMoment,checkOutMoment,today,minDate,maxDate,internalFormat,{});

// export for testing purposes
export const initialState  = {
  webViewURL: null,
  isApplyingFilter: false,
  loginDetails: {
    token: null,
    email: null,
    locAddress: null,
    // TODO: Add all properties and remove userInstance (uses Async Storage)
  },
  walletData: {
    walletState: WALLET_STATE.CHECKING,
    ethBalance: null,
    locBalance: null,
    isFirstLoading: true,
    skipLOCAddressRequest: false,
    // 'locAddress' comes with login data above
  },
  datesAndGuestsData: {
      today, minDate, maxDate, 
      calendarData, calendarMarkedDays, calendarMarkedMonths,
      guests: 2,
      adults: 2,
      children: 0,
      infants: 0,
      childrenBool: false,
      roomsDummyData: stringifyRoomsData( [ {adults: 2, children: []} ] ),
      regionId: '',
      inputFormat: inputDateFormat,
      displayFormat: displayDateFormat,
      internalFormat,
      onConfirm: null,
      weekDays: [],
      ...formatDatesData(today.year(), checkInMoment, checkOutMoment, inputDateFormat)
  },
};


export default handleActions(
  {
    [setIsApplyingFilter]: (state, {payload}) => {
      return {
        ...state,
        isApplyingFilter: payload
      };
    },

    [setDatesAndGuestsData]: (state, {payload}) => {
      return {
        ...state,
        datesAndGuestsData: {
          ...state.datesAndGuestsData,
          ...payload
        }
      };
    },

    [setWebViewURL]: (state, {payload}) => {
      return {
        ...state,
        webViewURL: payload
      };
    },

    [setLoginDetails]: (state, {payload}) => {
      let newState = {
        ...state
      };
      lodash.merge(newState, {loginDetails: payload});


      // a private case of loading user info before wallet data
      const validationResult = validateLOCAddress(payload.locAddress);
      if (payload.locAddress && validationResult == 1) {
        newState.walletData.skipLOCAddressRequest = true;
      }

      return newState;
    },

    [setWalletData]: (state, {payload}) => {
      let newState = cloneDeep(state);
      const { locAddress } = payload;

      // set locAddress in login data
      if (locAddress !== undefined) {
        newState.loginDetails.locAddress = locAddress;
      }
      delete payload.locAddress;

      // set walletData properties
      lodash.merge(newState, {
        walletData: {
          ...newState.walletData,
          ...payload
      }});

      // set isFirstLoading to false
      const { walletData } = newState;
      if (walletData.isFirstLoading && walletData.walletState == WALLET_STATE.READY) {
        newState.walletData.isFirstLoading = false;
      }

      return newState;
    },
  },
  initialState
);