import { handleActions } from 'redux-actions';
import {
  setIsApplyingFilter, setDatesAndGuestsData, setWebViewURL, setLoginDetails
} from '../../action/userInterface';

import moment from 'moment'
import { generateInitialCalendarData, formatDatesData } from '../../../components/screens/Calendar/utils';

const internalFormat = "YYYY-MM-DD";
const inputDateFormat = 'DD/MM/YYYY';
const displayDateFormat = 'ddd, DD MMM';
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
const initialState  = {
  webViewURL: null,
  isApplyingFilter: false,
  login: {
    token: null,
    email: null
  },
  datesAndGuestsData: {
      today, minDate, maxDate, 
      calendarData, calendarMarkedDays, calendarMarkedMonths,
      guests: 2,
      adults: 2,
      children: 0,
      infants: 0,
      childrenBool: false,
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
      return {
        ...state,
        login: Object.assign({}, payload)
      };
    },
  },
  initialState
);