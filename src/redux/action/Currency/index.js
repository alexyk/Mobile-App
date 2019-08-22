import { createAction } from "redux-actions";

const currencyInfo = {
  SET_CURRENCY: "SET_CURRENCY"
};

export const setCurrency = createAction(currencyInfo.SET_CURRENCY);
