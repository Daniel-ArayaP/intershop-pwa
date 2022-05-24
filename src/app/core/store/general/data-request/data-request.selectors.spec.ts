import { TestBed } from '@angular/core/testing';

import { DataRequest } from 'ish-core/models/data-request/data-request.model';
import { CoreStoreModule } from 'ish-core/store/core/core-store.module';
import { GeneralStoreModule } from 'ish-core/store/general/general-store.module';
import { makeHttpError } from 'ish-core/utils/dev/api-service-utils';
import { StoreWithSnapshots, provideStoreSnapshots } from 'ish-core/utils/dev/ngrx-testing';

import { confirmDataRequest, confirmDataRequestFail, confirmDataRequestSuccess } from './data-request.actions';
import { getDataRequest, getDataRequestLoading } from './data-request.selectors';

describe('Data Request Selectors', () => {
  let store$: StoreWithSnapshots;

  const dataRequest = { requestID: '0123456789', hash: 'test_hash' } as DataRequest;

  const payloadSuccess = dataRequest;
  const payloadAlreadyConfirmed = {
    requestID: '0123456789',
    hash: 'test_hash',
    code: 'already.confirmed',
    status: 200,
  } as DataRequest;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CoreStoreModule.forTesting(), GeneralStoreModule.forTesting('confirmations')],
      providers: [provideStoreSnapshots()],
    });

    store$ = TestBed.inject(StoreWithSnapshots);
  });

  describe('with empty state', () => {
    it('should not set status when used', () => {
      expect(getDataRequest(store$.state).status).toBeUndefined();
      expect(getDataRequestLoading(store$.state)).toBeFalsy();
    });
  });

  describe('loading confirmation', () => {
    beforeEach(() => {
      store$.dispatch(confirmDataRequest({ data: dataRequest }));
    });
    it('should set the state to loading', () => {
      expect(getDataRequestLoading(store$.state)).toBeTrue();
    });

    describe('and reporting success', () => {
      beforeEach(() => {
        store$.dispatch(confirmDataRequestSuccess(payloadSuccess));
      });

      it('should set loading to false', () => {
        expect(getDataRequestLoading(store$.state)).toBeFalse();
        expect(getDataRequest(store$.state).status).toEqual(200);
      });
    });

    describe('and reporting already confirmed', () => {
      beforeEach(() => {
        store$.dispatch(confirmDataRequestSuccess(payloadAlreadyConfirmed));
      });

      it('should set loading to false', () => {
        expect(getDataRequestLoading(store$.state)).toBeFalse();
        expect(getDataRequest(store$.state).status).toEqual(200);
      });
    });

    describe('and reporting failure', () => {
      beforeEach(() => {
        store$.dispatch(confirmDataRequestFail({ error: makeHttpError({ status: 422, message: 'error' }) }));
      });

      it('should not have loaded category on error', () => {
        expect(getDataRequestLoading(store$.state)).toBeFalse();
        expect(getDataRequest(store$.state).status).toEqual(422);
      });
    });
  });
});
