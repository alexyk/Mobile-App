import { createAction } from "redux-actions";

const actionNames = {
  SET_SEARCH: "SET_SEARCH",
  SET_SEARCH_STRING: "SET_SEARCH_STRING",
  SET_SEARCH_FILTERED: "SET_SEARCH_FILTERED",
  SET_GUEST_DATA: "SET_GUEST_DATA"
};

export const setSearch = createAction(actionNames.SET_SEARCH);
export const setSearchString = createAction(actionNames.SET_SEARCH_STRING);
export const setSearchFiltered = createAction(actionNames.SET_SEARCH_FILTERED);
export const setGuestData = createAction(actionNames.SET_GUEST_DATA);
