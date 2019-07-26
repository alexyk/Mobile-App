import { handleActions } from 'redux-actions';
import { setSearch, setSearchFiltered, setSearchString } from '../../action/hotels';

const initialState  = {
  searchString: null,
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
    [setSearchString]: (state, {payload}) => {
      return {
        ...state,
        searchString: payload
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