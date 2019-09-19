import { createAction } from "redux-actions";
import requester from "../../../initDependencies";
import { serverRequest } from "../../../services/utilities/serverUtils";

const countryInfo = {
  SET_COUNTRIES: "SET_COUNTRIES"
};

export const getCountries = () => {
  return dispatch => {
    // prettier-ignore
    serverRequest('Action getCountries', requester.getCountries, [true],
      data => {
        data.sort((a,b) => {
          const result = (
            a && b && a.name && b.name
              ? (a.name < b.name
                  ? -1
                  : 1
              )
              : 0
            )

          return result;
        });
        dispatch(setCountries({ countries: data }))
      }
    );
  };
};

export const setCountries = createAction(countryInfo.SET_COUNTRIES);
