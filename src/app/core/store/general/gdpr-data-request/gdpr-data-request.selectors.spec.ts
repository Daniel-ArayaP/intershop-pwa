import { TestBed } from '@angular/core/testing';

import { GDPRDataRequest } from 'ish-core/models/gdpr-data-request/gdpr-data-request.model';
import { CoreStoreModule } from 'ish-core/store/core/core-store.module';
import { GeneralStoreModule } from 'ish-core/store/general/general-store.module';
import { makeHttpError } from 'ish-core/utils/dev/api-service-utils';
import { StoreWithSnapshots, provideStoreSnapshots } from 'ish-core/utils/dev/ngrx-testing';

import {
  gdprConfirmDataRequest,
  gdprConfirmDataRequestFail,
  gdprConfirmDataRequestSuccess,
} from './gdpr-data-request.actions';
import {
  getGDPRDataRequestError,
  getGDPRDataRequestLoading,
  isFirstTimeGDPRDataRequest,
} from './gdpr-data-request.selectors';

describe('Gdpr Data Request Selectors', () => {
  let store$: StoreWithSnapshots;

  const dataRequest = {
    requestID: '0123456789',
    hash: 'test_hash',
    infoCode: 'gdpr_request.confirmed.info',
  } as GDPRDataRequest;

  const payloadSuccess = dataRequest;
  const payloadAlreadyConfirmed = {
    requestID: '0123456789',
    hash: 'test_hash',
    infoCode: 'already.confirmed',
  } as GDPRDataRequest;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CoreStoreModule.forTesting(), GeneralStoreModule.forTesting('confirmations')],
      providers: [provideStoreSnapshots()],
    });

    store$ = TestBed.inject(StoreWithSnapshots);
  });

  describe('with empty state', () => {
    it('should not set status when used', () => {
      expect(isFirstTimeGDPRDataRequest(store$.state)).toBeTruthy();
      expect(getGDPRDataRequestLoading(store$.state)).toBeFalsy();
      expect(getGDPRDataRequestError(store$.state)).toBeUndefined();
    });
  });

  describe('loading confirmation', () => {
    beforeEach(() => {
      store$.dispatch(gdprConfirmDataRequest({ data: dataRequest }));
    });
    it('should set the state to loading', () => {
      expect(getGDPRDataRequestLoading(store$.state)).toBeTruthy();
    });

    describe('and reporting success', () => {
      beforeEach(() => {
        store$.dispatch(gdprConfirmDataRequestSuccess(payloadSuccess));
      });

      it('should set loading to false', () => {
        expect(getGDPRDataRequestLoading(store$.state)).toBeFalsy();
        expect(isFirstTimeGDPRDataRequest(store$.state)).toBeTruthy();
      });
    });

    describe('and reporting already confirmed', () => {
      beforeEach(() => {
        store$.dispatch(gdprConfirmDataRequestSuccess(payloadAlreadyConfirmed));
      });

      it('should set loading to false', () => {
        expect(getGDPRDataRequestLoading(store$.state)).toBeFalsy();
        expect(isFirstTimeGDPRDataRequest(store$.state)).toBeFalsy();
      });
    });

    describe('and reporting failure', () => {
      beforeEach(() => {
        store$.dispatch(gdprConfirmDataRequestFail({ error: makeHttpError({ status: 422, message: 'error' }) }));
      });

      it('should set an error', () => {
        expect(getGDPRDataRequestLoading(store$.state)).toBeFalsy();
        expect(getGDPRDataRequestError(store$.state)).toBeTruthy();
      });
    });
  });
});
