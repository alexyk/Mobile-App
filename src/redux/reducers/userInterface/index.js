import { handleActions } from 'redux-actions';
import { setIsApplyingFilter, setDatesAndGuestsData
} from '../../action/userInterface';

import moment from 'moment'

const dateFormat = 'DD/MM/YYYY';
const dateFormatDisplay = 'ddd, DD MMM';
const startDate = moment().add(1, 'day');
const endDate = moment().add(2, 'day');
const initialState  = {
  isApplyingFilter: false,
  datesAndGuestsData: {
      guests: 2,
      adults: 2,
      children: 0,
      infants: 0,
      checkInDate: startDate.format(dateFormatDisplay).toString(),
      checkOutDate: endDate.format(dateFormatDisplay).toString(),
      checkInDateMoment: startDate,
      checkOutDateMoment: endDate,
      startDate: startDate.format(dateFormat).toString(),
      endDate: endDate.format(dateFormat).toString(),
      format_input: "DD/MM/YYYY",
      format_display: "ddd, DD MMM",
      onConfirm: null
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