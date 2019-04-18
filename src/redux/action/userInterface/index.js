import { createAction } from 'redux-actions';

const actionNames = {
    SET_IS_APPLYING_FILTER: 'SET_IS_APPLYING_FILTER',
};

export const setIsApplyingFilter = createAction(actionNames.SET_IS_APPLYING_FILTER);