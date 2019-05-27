import { createAction } from 'redux-actions';

const actionNames = {
    SET_IS_APPLYING_FILTER: 'SET_IS_APPLYING_FILTER',
    SET_DATES_AND_GUESTS_DATA: 'SET_DATES_AND_GUESTS_DATA',
};

export const setIsApplyingFilter = createAction(actionNames.SET_IS_APPLYING_FILTER);
export const setDatesAndGuestsData = createAction(actionNames.SET_DATES_AND_GUESTS_DATA);