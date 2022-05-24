import { createSelector } from '@ngrx/store';

import { getGeneralState } from 'ish-core/store/general/general-store';

const getDataRequestState = createSelector(getGeneralState, state => state.confirmations);

export const getDataRequestLoading = createSelector(getDataRequestState, state => state.loading);

export const getDataRequestError = createSelector(getDataRequestState, state => state.error);

export const getDataRequest = createSelector(getDataRequestState, state => state);
