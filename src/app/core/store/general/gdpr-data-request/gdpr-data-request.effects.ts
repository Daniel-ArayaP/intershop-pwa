import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, map } from 'rxjs/operators';

import { UserService } from 'ish-core/services/user/user.service';
import { mapErrorToAction, mapToPayload } from 'ish-core/utils/operators';

import {
  gdprConfirmDataRequest,
  gdprConfirmDataRequestFail,
  gdprConfirmDataRequestSuccess,
} from './gdpr-data-request.actions';

@Injectable()
export class GDPRDataRequestEffects {
  constructor(private actions$: Actions, private userService: UserService) {}

  confirmGDPRDataRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(gdprConfirmDataRequest),
      mapToPayload(),
      concatMap(payload =>
        this.userService
          .confirmGDPRDataRequest(payload.data)
          .pipe(map(gdprConfirmDataRequestSuccess), mapErrorToAction(gdprConfirmDataRequestFail))
      )
    )
  );
}
