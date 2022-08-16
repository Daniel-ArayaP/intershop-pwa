import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { routerNavigatedAction } from '@ngrx/router-store';
import { concatMap, filter, map } from 'rxjs/operators';

import { UserService } from 'ish-core/services/user/user.service';
import { mapToRouterState } from 'ish-core/store/core/router';
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

  /**
   * Listener for gdpr email routing. If route is called the action {@link gdprConfirmDataRequest} is dispatched.
   */
  routeListenerForDataRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(routerNavigatedAction),
      mapToRouterState(),
      filter(routerState => /^\/(gdpr-requests*)/.test(routerState.url)),
      map(({ queryParams }) =>
        gdprConfirmDataRequest({ data: { hash: queryParams.Hash, requestID: queryParams.PersonalDataRequestID } })
      )
    )
  );
}
