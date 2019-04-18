import { handleActions } from 'redux-actions';
import { setIsApplyingFilter } from '../../action/userInterface';

const initialState  = {
  isApplyingFilter: false
};

export default handleActions(
  {
    [setIsApplyingFilter]: (state, {payload}) => {
      return {
        ...state,
        isApplyingFilter: payload
      };
    },
  },
  initialState
);