import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, map } from 'rxjs/operators';

import { UserService } from 'ish-core/services/user/user.service';
import { mapErrorToAction, mapToPayload } from 'ish-core/utils/operators';

import { confirmDataRequest, confirmDataRequestFail, confirmDataRequestSuccess } from './data-request.actions';

@Injectable()
export class DataRequestEffects {
  constructor(private actions$: Actions, private userService: UserService) {}

  confirmDataRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(confirmDataRequest),
      mapToPayload(),
      concatMap(payload =>
        this.userService
          .confirmDataRequest(payload.data)
          .pipe(map(confirmDataRequestSuccess), mapErrorToAction(confirmDataRequestFail))
      )
    )
  );
}
