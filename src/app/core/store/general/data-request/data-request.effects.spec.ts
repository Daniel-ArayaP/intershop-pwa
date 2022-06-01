import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { cold, hot } from 'jest-marbles';
import { Observable, of, throwError } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { DataRequest } from 'ish-core/models/data-request/data-request.model';
import { UserService } from 'ish-core/services/user/user.service';
import { CoreStoreModule } from 'ish-core/store/core/core-store.module';
import { GeneralStoreModule } from 'ish-core/store/general/general-store.module';
import { makeHttpError } from 'ish-core/utils/dev/api-service-utils';

import { confirmDataRequest, confirmDataRequestFail, confirmDataRequestSuccess } from './data-request.actions';
import { DataRequestEffects } from './data-request.effects';

describe('Data Request Effects', () => {
  let actions$: Observable<Action>;
  let effects: DataRequestEffects;
  let userServiceMock: UserService;

  const dataRequest = { requestID: '0123456789', hash: 'test_hash' } as DataRequest;
  const payloadSuccess = { hash: 'test_hash', requestID: 'request-id' } as DataRequest;

  beforeEach(() => {
    userServiceMock = mock(UserService);
    when(userServiceMock.confirmDataRequest(anything())).thenReturn(of(payloadSuccess));

    TestBed.configureTestingModule({
      imports: [CoreStoreModule.forTesting(), GeneralStoreModule.forTesting('confirmations')],
      providers: [
        { provide: UserService, useFactory: () => instance(userServiceMock) },
        DataRequestEffects,
        provideMockActions(() => actions$),
      ],
    });

    effects = TestBed.inject(DataRequestEffects);
  });

  describe('confirmDataRequest$', () => {
    it('should call the userService for ConfirmDataRequest', done => {
      const action = confirmDataRequest({ data: dataRequest });
      actions$ = of(action);

      effects.confirmDataRequest$.subscribe(() => {
        verify(userServiceMock.confirmDataRequest(anything())).once();
        done();
      });
    });
    it('should map to action of type ConfirmDataRequestSuccess', () => {
      const action = confirmDataRequest({ data: dataRequest });
      const completion = confirmDataRequestSuccess(payloadSuccess);
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.confirmDataRequest$).toBeObservable(expected$);
    });
    it('should map invalid request to action of type ConfirmDataRequestFail', () => {
      when(userServiceMock.confirmDataRequest(anything())).thenReturn(
        throwError(() => makeHttpError({ message: 'invalid' }))
      );
      const action = confirmDataRequest({ data: dataRequest });
      const error = makeHttpError({ message: 'invalid' });
      const completion = confirmDataRequestFail({ error });
      actions$ = hot('-a-a-a', { a: action });
      const expected$ = cold('-c-c-c', { c: completion });

      expect(effects.confirmDataRequest$).toBeObservable(expected$);
    });
  });
});
