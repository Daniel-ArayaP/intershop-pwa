import { createAction } from '@ngrx/store';

import { DataRequest } from 'ish-core/models/data-request/data-request.model';
import { httpError, payload } from 'ish-core/utils/ngrx-creators';

export const confirmDataRequest = createAction('[DataRequest] Confirm Data Request', payload<{ data: DataRequest }>());

export const confirmDataRequestSuccess = createAction(
  '[DataRequest] Confirm Data Request Success',
  payload<DataRequest>()
);

export const confirmDataRequestFail = createAction('[DataRequest] Confirm Data Request Failed', httpError());
