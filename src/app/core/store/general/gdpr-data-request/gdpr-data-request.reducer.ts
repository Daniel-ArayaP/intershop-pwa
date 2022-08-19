import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { GDPRDataRequest } from 'ish-core/models/gdpr-data-request/gdpr-data-request.model';
import { HttpError } from 'ish-core/models/http-error/http-error.model';
import { setErrorOn, setLoadingOn, unsetLoadingOn } from 'ish-core/utils/ngrx-creators';

import {
  gdprConfirmDataRequest,
  gdprConfirmDataRequestFail,
  gdprConfirmDataRequestSuccess,
} from './gdpr-data-request.actions';

const gdprDataRequestAdapter = createEntityAdapter<GDPRDataRequest>({
  selectId: dataRequest => dataRequest.requestID,
});

export interface GDPRDataRequestState extends EntityState<GDPRDataRequest> {
  loading: boolean;
  error: HttpError;
  firstGDPRDataRequest: boolean;
}

const initialState: GDPRDataRequestState = gdprDataRequestAdapter.getInitialState({
  loading: false,
  error: undefined,
  firstGDPRDataRequest: true,
});

export const gdprDataRequestReducer = createReducer(
  initialState,
  setLoadingOn(gdprConfirmDataRequest),
  unsetLoadingOn(gdprConfirmDataRequestSuccess, gdprConfirmDataRequestFail),
  setErrorOn(gdprConfirmDataRequestFail),
  on(gdprConfirmDataRequestSuccess, (state, action) => {
    const dataRequest = action.payload;

    return {
      ...gdprDataRequestAdapter.upsertOne(dataRequest, state),
      firstGDPRDataRequest: dataRequest.infoCode === 'gdpr_request.confirmed.info',
    };
  })
);
