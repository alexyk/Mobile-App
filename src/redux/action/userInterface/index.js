import { createAction } from "redux-actions";

const actionNames = {
  SET_IS_APPLYING_FILTER: "SET_IS_APPLYING_FILTER",
  SET_DATES_AND_GUESTS_DATA: "SET_DATES_AND_GUESTS_DATA",
  SET_WEBVIEW_URL: "SET_WEBVIEW_URL",
  SET_LOGIN_DETAILS: "SET_LOGIN_DETAILS",
  SET_WALLET_DATA: "SET_WALLET_DATA"
};

export const setIsApplyingFilter = createAction(
  actionNames.SET_IS_APPLYING_FILTER
);
export const setDatesAndGuestsData = createAction(
  actionNames.SET_DATES_AND_GUESTS_DATA
);
export const setWebViewURL = createAction(actionNames.SET_WEBVIEW_URL);
export const setLoginDetails = createAction(actionNames.SET_LOGIN_DETAILS);
export const setWalletData = createAction(actionNames.SET_WALLET_DATA);
