import { handleActions } from "redux-actions";
import { setSearch, setSearchFiltered, setSearchString, setGuestData } from "../../action/hotels";
import { cloneDeep } from 'lodash';


const initialState = {
  searchString: null,
  searchResults: [],
  searchResultsFiltered: [],
  guestData: null
};

export default handleActions(
  {
    [setSearch]: (state, { payload }) => {
      return {
        ...state,
        searchResults: payload
      };
    },
    [setSearchString]: (state, { payload }) => {
      return {
        ...state,
        searchString: payload
      };
    },
    [setSearchFiltered]: (state, { payload }) => {
      return {
        ...state,
        searchResultsFiltered: payload
      };
    },
    [setGuestData]: (state, { payload }) => {
      return {
        ...state,
        guestData: payload
      };
    }
  },
  initialState
);
