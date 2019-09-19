import { handleActions } from "redux-actions";
import { setSearch, setSearchFiltered, setSearchString, setGuestData, setSearchState, setPriceVisible } from "../../action/hotels";



const initialState = {
  searchString: null,
  searchResults: [],
  searchResultsFiltered: [],
  guestData: null,
  isSearchDone: false,
  isPriceVisible: false
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
    },
    [setSearchState]: (state, { payload }) => {
      return {
        ...state,
        isSearchDone: payload
      };
    },
    [setPriceVisible]: (state, { payload }) => {
      return {
        ...state,
        isPriceVisible: payload
      };
    }
  },
  initialState
);
