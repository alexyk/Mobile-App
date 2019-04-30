import { handleActions } from 'redux-actions';
import { setSearch, setSearchFiltered } from '../../action/hotels';

const initialState  = {
  searchResults: [],
  searchResultsFiltered: [],
};

export default handleActions(
  {
    [setSearch]: (state, {payload}) => {
      return {
        ...state,
        searchResults: payload
      };
    },
    [setSearchFiltered]: (state, {payload}) => {
      return {
        ...state,
        searchResultsFiltered: payload
      };
    },
  },
  initialState
);