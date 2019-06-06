import { createAction } from 'redux-actions';
import requester from '../../../initDependencies';
import { onNetworkError } from '../../../components/screens/utils';

const countryInfo = {
    SET_COUNTRIES: 'SET_COUNTRIES'
};

export const getCountries = () => {
    return dispatch => {
        requester.getCountries(true)
        .then(res => {
            if (res && res.body && res.success) {
                res.body
                    .then(data => {
                        dispatch(setCountries({countries:data}));
                    })
                    .catch(function(error) {
                        onNetworkError(`Error with getCountries call - level 3: ${error.message}`, {error,res})
                    });
            } else {
                onNetworkError(`Error with getCountries call - level 2`, {res})
            }
        })
        .catch(function(error){
            onNetworkError(`Error with getCountries call - level 1: ${error.message}`, {error})
        });
    }
};

export const setCountries = createAction(countryInfo.SET_COUNTRIES);