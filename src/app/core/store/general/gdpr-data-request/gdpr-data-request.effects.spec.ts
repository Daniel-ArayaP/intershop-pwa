import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of, throwError } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { GDPRDataRequest } from 'ish-core/models/gdpr-data-request/gdpr-data-request.model';
import { UserService } from 'ish-core/services/user/user.service';
import { makeHttpError } from 'ish-core/utils/dev/api-service-utils';
import { routerTestNavigatedAction } from 'ish-core/utils/dev/routing';

import {
  gdprConfirmDataRequest,
  gdprConfirmDataRequestFail,
  gdprConfirmDataRequestSuccess,
} from './gdpr-data-request.actions';
import { GDPRDataRequestEffects } from './gdpr-data-request.effects';

describe('Gdpr Data Request Effects', () => {
  let actions$: Observable<Action>;
  let effects: GDPRDataRequestEffects;
  let userServiceMock: UserService;
  let router: Router;

  const requestID = '0123456789';
  const hash = 'test_hash';

  const dataRequest = { requestID, hash } as GDPRDataRequest;

  beforeEach(() => {
    userServiceMock = mock(UserService);
    when(userServiceMock.confirmGDPRDataRequest(anything())).thenReturn(of(dataRequest));

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: '**', children: [] }])],
      providers: [
        { provide: UserService, useFactory: () => instance(userServiceMock) },
        GDPRDataRequestEffects,
        provideMockActions(() => actions$),
      ],
    });

    effects = TestBed.inject(GDPRDataRequestEffects);
    router = TestBed.inject(Router);
  });

  describe('confirmGDPRDataRequest$', () => {
    it('should call the userService for GDPRConfirmDataRequest', done => {
      const action = gdprConfirmDataRequest({ data: dataRequest });
      actions$ = of(action);

      effects.confirmGDPRDataRequest$.subscribe(() => {
        verify(userServiceMock.confirmGDPRDataRequest(anything())).once();
        done();
      });
    });
    it('should map to action of type GDPRConfirmDataRequestSuccess', () => {
      const action = gdprConfirmDataRequest({ data: dataRequest });
      const completion = gdprConfirmDataRequestSuccess(dataRequest);
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.confirmGDPRDataRequest$).toBeObservable(expected$);
    });
    it('should map invalid request to action of type GDPRConfirmDataRequestFail', () => {
      when(userServiceMock.confirmGDPRDataRequest(anything())).thenReturn(
        throwError(() => makeHttpError({ message: 'invalid' }))
      );
      const action = gdprConfirmDataRequest({ data: dataRequest });
      const error = makeHttpError({ message: 'invalid' });
      const completion = gdprConfirmDataRequestFail({ error });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.confirmGDPRDataRequest$).toBeObservable(expected$);
    });
  });

  describe('routeListenerForDataRequests', () => {
    it('should fire GdprConfirmDataRequest when route gdpr-requests is navigated', () => {
      router.navigateByUrl('/gdpr-requests');

      const action = routerTestNavigatedAction({
        routerState: { url: '/gdpr-requests', queryParams: { Hash: hash, PersonalDataRequestID: requestID } },
      });
      actions$ = of(action);

      const completion = gdprConfirmDataRequest({ data: dataRequest });
      actions$ = hot('-a', { a: action });
      const expected$ = cold('-(c)', { c: completion });

      expect(effects.routeListenerForDataRequests$).toBeObservable(expected$);
    });
  });
});
