import { createSelector } from '@ngrx/store';

import { getGeneralState } from 'ish-core/store/general/general-store';

const getGDPRDataRequestState = createSelector(getGeneralState, state => state.confirmations);

export const getGDPRDataRequestLoading = createSelector(getGDPRDataRequestState, state => state.loading);

export const getGDPRDataRequestError = createSelector(getGDPRDataRequestState, state => state.error);

export const isFirstGDPRDataRequest = createSelector(getGDPRDataRequestState, state => state.firstGDPRDataRequest);
