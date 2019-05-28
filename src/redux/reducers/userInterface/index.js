import { handleActions } from 'redux-actions';
import { setIsApplyingFilter, setDatesAndGuestsData
} from '../../action/userInterface';

import moment from 'moment'
import { formatDatesData } from '../../../components/screens/utils';

const internalFormat = "YYYY-MM-DD";
const inputDateFormat = 'DD/MM/YYYY';
const displayDateFormat = 'ddd, DD MMM';
const today = moment().startOf('day');
const startMoment = today.clone().add(1, 'day');
const endMoment = today.clone().add(2, 'day');
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
const initialState  = {
  isApplyingFilter: false,
  datesAndGuestsData: {
      calendarData:[],
      guests: 2,
      adults: 2,
      children: 0,
      infants: 0,
      childrenBool: false,
      today, minDate, maxDate, 
      inputFormat: inputDateFormat,
      displayFormat: displayDateFormat,
      internalFormat,
      onConfirm: null,
      weekDays: [],
      ...formatDatesData(today, startMoment, endMoment, displayDateFormat, inputDateFormat)
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
  },
  initialState
);