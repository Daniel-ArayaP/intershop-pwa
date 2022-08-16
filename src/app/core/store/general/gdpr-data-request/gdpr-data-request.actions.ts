import { createAction } from '@ngrx/store';

import { GDPRDataRequest } from 'ish-core/models/gdpr-data-request/gdpr-data-request.model';
import { httpError, payload } from 'ish-core/utils/ngrx-creators';

export const gdprConfirmDataRequest = createAction(
  '[GDPRDataRequest API] Confirm GDPR Data Request',
  payload<{ data: GDPRDataRequest }>()
);

export const gdprConfirmDataRequestSuccess = createAction(
  '[GDPRDataRequest API] Confirm GDPR Data Request Success',
  payload<GDPRDataRequest>()
);

export const gdprConfirmDataRequestFail = createAction(
  '[GDPRDataRequest API] Confirm GDPR Data Request Failed',
  httpError()
);
