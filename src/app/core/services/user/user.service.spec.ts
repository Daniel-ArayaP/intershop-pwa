import { HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of, throwError } from 'rxjs';
import { anyString, anything, capture, instance, mock, verify, when } from 'ts-mockito';

import { AppFacade } from 'ish-core/facades/app.facade';
import { Address } from 'ish-core/models/address/address.model';
import { Credentials } from 'ish-core/models/credentials/credentials.model';
import { CustomerData } from 'ish-core/models/customer/customer.interface';
import { Customer, CustomerRegistrationType, CustomerUserType } from 'ish-core/models/customer/customer.model';
import {
  GDPRDataRequestData,
  GDPRDataRequestInfo,
} from 'ish-core/models/gdpr-data-request/gdpr-data-request.interface';
import { GDPRDataRequest } from 'ish-core/models/gdpr-data-request/gdpr-data-request.model';
import { User } from 'ish-core/models/user/user.model';
import { ApiService, AvailableOptions } from 'ish-core/services/api/api.service';
import { getUserPermissions } from 'ish-core/store/customer/authorization';
import { getLoggedInCustomer, getLoggedInUser } from 'ish-core/store/customer/user';
import { encodeResourceID } from 'ish-core/utils/url-resource-ids';

import { UserService } from './user.service';

describe('User Service', () => {
  let userService: UserService;
  let apiServiceMock: ApiService;
  let appFacade: AppFacade;
  let store$: MockStore;

  beforeEach(() => {
    apiServiceMock = mock(ApiService);
    appFacade = mock(AppFacade);

    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useFactory: () => instance(apiServiceMock) },
        { provide: AppFacade, useFactory: () => instance(appFacade) },
        provideMockStore({ selectors: [{ selector: getLoggedInCustomer, value: undefined }] }),
      ],
    });
    userService = TestBed.inject(UserService);
    when(appFacade.isAppTypeREST$).thenReturn(of(true));
    when(appFacade.currentLocale$).thenReturn(of('en_US'));
    when(appFacade.customerRestResource$).thenReturn(of('customers'));
    store$ = TestBed.inject(MockStore);
  });

  describe('SignIn a user', () => {
    it('should login a user when correct credentials are entered', done => {
      const loginDetail = { login: 'patricia@test.intershop.de', password: '!InterShop00!' };
      when(apiServiceMock.get('customers/-', anything())).thenReturn(
        of({ customerNo: 'PC', customerType: 'PRIVATE' } as CustomerData)
      );
      when(apiServiceMock.get('privatecustomers/-')).thenReturn(
        of({ customerNo: 'PC', customerType: 'PRIVATE' } as CustomerData)
      );
      when(apiServiceMock.get('personalization')).thenReturn(of({ pgid: '6FGMJtFU2xuRpG9I3CpTS7fc0000' }));

      userService.signInUser(loginDetail).subscribe(data => {
        const [, options] = capture<{}, { headers: HttpHeaders }>(apiServiceMock.get).first();
        const headers = options?.headers;
        expect(headers).toBeTruthy();
        expect(headers.get('Authorization')).toEqual('BASIC cGF0cmljaWFAdGVzdC5pbnRlcnNob3AuZGU6IUludGVyU2hvcDAwIQ==');

        expect(data).toHaveProperty('customer.customerNo', 'PC');
        expect(data).toHaveProperty('pgid', '6FGMJtFU2xuRpG9I3CpTS7fc0000');
        done();
      });
    });

    it('should login a private user when correct credentials are entered', done => {
      const loginDetail = { login: 'patricia@test.intershop.de', password: '!InterShop00!' };
      when(apiServiceMock.get('customers/-', anything())).thenReturn(
        of({ customerNo: 'PC', customerType: 'PRIVATE' } as CustomerData)
      );
      when(apiServiceMock.get('privatecustomers/-')).thenReturn(of({ customerNo: 'PC' } as CustomerData));
      when(apiServiceMock.get('personalization')).thenReturn(of({ pgid: '123' }));

      userService.signInUser(loginDetail).subscribe(() => {
        verify(apiServiceMock.get(`customers/-`, anything())).once();
        verify(apiServiceMock.get(`privatecustomers/-`)).once();
        verify(apiServiceMock.get('personalization')).once();
        done();
      });
    });

    it('should login a business user when correct credentials are entered', done => {
      const loginDetail = { login: 'patricia@test.intershop.de', password: '!InterShop00!' };
      when(apiServiceMock.get(anything(), anything())).thenReturn(
        of({ customerNo: 'PC', customerType: 'SMBCustomer' } as CustomerData)
      );
      when(apiServiceMock.get('personalization')).thenReturn(of({ pgid: '123' }));

      userService.signInUser(loginDetail).subscribe(() => {
        verify(apiServiceMock.get(`customers/-`, anything())).once();
        verify(apiServiceMock.get(`privatecustomers/-`, anything())).never();
        verify(apiServiceMock.get('personalization')).once();
        done();
      });
    });

    it('should return error message when wrong credentials are entered', done => {
      const errorMessage = '401 and Unauthorized';
      const userDetails = { login: 'intershop@123.com', password: 'wrong' };
      when(apiServiceMock.get(anything(), anything())).thenReturn(throwError(() => new Error(errorMessage)));
      userService.signInUser(userDetails).subscribe({
        next: fail,
        error: error => {
          expect(error).toBeTruthy();
          expect(error.message).toBe(errorMessage);
          done();
        },
      });
    });

    it('should login a user by token when requested and successful', done => {
      when(apiServiceMock.get(anything(), anything())).thenReturn(
        of({ customerNo: '4711', type: 'SMBCustomer', customerType: 'SMBCustomer' } as CustomerData)
      );
      when(apiServiceMock.get('personalization')).thenReturn(of({ pgid: '1234' }));

      userService.signInUserByToken().subscribe(() => {
        verify(apiServiceMock.get('customers/-', anything())).once();
        verify(apiServiceMock.get('privatecustomers/-', anything())).never();
        verify(apiServiceMock.get('personalization')).once();
        const [path] = capture<string>(apiServiceMock.get).first();
        expect(path).toEqual('customers/-');
        done();
      });
    });

    it('should login a user by given token when requested and successful', done => {
      when(apiServiceMock.get(anything(), anything())).thenReturn(
        of({ customerNo: '4711', type: 'SMBCustomer', customerType: 'SMBCustomer' } as CustomerData)
      );
      when(apiServiceMock.get('personalization')).thenReturn(of({ pgid: '1234' }));

      userService.signInUserByToken('12345').subscribe(() => {
        verify(apiServiceMock.get('customers/-', anything())).once();
        verify(apiServiceMock.get('privatecustomers/-', anything())).never();
        verify(apiServiceMock.get('personalization')).once();
        const [path, options] = capture<string, AvailableOptions>(apiServiceMock.get).first();
        expect(options.headers.get(ApiService.TOKEN_HEADER_KEY)).toMatchInlineSnapshot(`"12345"`);
        expect(path).toEqual('customers/-');
        done();
      });
    });
  });

  describe('Register a user', () => {
    it('should return an error when called with undefined', done => {
      when(apiServiceMock.post(anything(), anything())).thenReturn(of({}));

      userService.createUser(undefined).subscribe({
        next: fail,
        error: err => {
          expect(err).toMatchInlineSnapshot(`[Error: createUser() called without required body data]`);
          done();
        },
      });

      verify(apiServiceMock.post(anything(), anything())).never();
    });

    it("should create a new individual user when 'createUser' is called", done => {
      when(apiServiceMock.post(anyString(), anything(), anything())).thenReturn(of({}));
      when(apiServiceMock.get(anything(), anything())).thenReturn(
        of({ customerNo: 'PC', customerType: 'PRIVATE' } as CustomerData)
      );
      when(apiServiceMock.get(anything())).thenReturn(
        of({ customerNo: 'PC', customerType: 'PRIVATE' } as CustomerData)
      );

      const payload = {
        customer: { customerNo: '4711', isBusinessCustomer: false } as Customer,
        address: {} as Address,
        credentials: { login: 'patricia@test.intershop.de', password: 'xyz' } as Credentials,
        user: {} as User,
      } as CustomerRegistrationType;

      userService.createUser(payload).subscribe(() => {
        verify(apiServiceMock.post('privatecustomers', anything(), anything())).once();
        verify(apiServiceMock.get('customers/-', anything())).once();
        verify(apiServiceMock.get('privatecustomers/-')).once();
        done();
      });
    });
  });

  describe('Update a user', () => {
    beforeEach(() => {
      when(apiServiceMock.put(anyString(), anything(), anything())).thenReturn(of({}));
    });

    it('should return an error when called with undefined', done => {
      userService.updateUser(undefined).subscribe({
        next: fail,
        error: err => {
          expect(err).toMatchInlineSnapshot(`[Error: updateUser() called without required body data]`);
          done();
        },
      });

      verify(apiServiceMock.put(anything(), anything(), anything())).never();
    });

    it("should update a individual user when 'updateUser' is called", done => {
      const payload = {
        customer: { customerNo: '4711', isBusinessCustomer: false } as Customer,
        user: {} as User,
      } as CustomerUserType;

      userService.updateUser(payload).subscribe(() => {
        verify(apiServiceMock.put('customers/-', anything(), anything())).once();
        done();
      });
    });

    it("should update a business user when 'updateUser' is called", done => {
      const payload = {
        customer: { customerNo: '4711', isBusinessCustomer: true } as Customer,
        user: {} as User,
      } as CustomerUserType;

      userService.updateUser(payload).subscribe(() => {
        verify(apiServiceMock.put('customers/-/users/-', anything(), anything())).once();
        done();
      });
    });
  });

  describe('Update a user password', () => {
    it('should return an error when called and the customer parameter is missing', done => {
      userService.updateUserPassword(undefined, undefined, '123', '1234').subscribe({
        next: fail,
        error: err => {
          expect(err).toMatchInlineSnapshot(`[Error: updateUserPassword() called without customer]`);
          done();
        },
      });

      verify(apiServiceMock.put(anything(), anything())).never();
    });

    it('should return an error when called and the password parameter is missing', done => {
      userService.updateUserPassword({} as Customer, {} as User, '', '').subscribe({
        next: fail,
        error: err => {
          expect(err).toMatchInlineSnapshot(`[Error: updateUserPassword() called without password]`);
          done();
        },
      });

      verify(apiServiceMock.put(anything(), anything())).never();
    });

    it("should update a password of a individual user when 'updateUserPassword' is called", done => {
      when(apiServiceMock.put(anyString(), anything())).thenReturn(of({}));

      const customer = { customerNo: '4711', isBusinessCustomer: false } as Customer;
      const user = { email: 'foo@foo.bar' } as User;

      userService.updateUserPassword(customer, user, '123', '1234').subscribe(() => {
        verify(apiServiceMock.put('customers/-/credentials/password', anything())).once();
        done();
      });
    });

    it("should update a password of a business user when 'updateUser' is called", done => {
      when(apiServiceMock.put(anyString(), anything())).thenReturn(of({}));

      const customer = { customerNo: '4711', isBusinessCustomer: true } as Customer;
      const user = { email: 'foo@foo.bar' } as User;

      userService.updateUserPassword(customer, user, '123', '1234').subscribe(() => {
        verify(apiServiceMock.put('customers/-/users/-/credentials/password', anything())).once();
        done();
      });
    });
  });

  describe('Updates a customer', () => {
    it('should return an error when called and the customer parameter is missing', done => {
      when(apiServiceMock.put(anything(), anything())).thenReturn(of({}));

      userService.updateCustomer(undefined).subscribe({
        next: fail,
        error: err => {
          expect(err).toMatchInlineSnapshot(`[Error: updateCustomer() called without customer]`);
          done();
        },
      });

      verify(apiServiceMock.put(anything(), anything())).never();
    });

    it('should return an error when called for an individual customer', done => {
      when(apiServiceMock.put(anything(), anything())).thenReturn(of({}));

      userService.updateCustomer({ isBusinessCustomer: false } as Customer).subscribe({
        next: fail,
        error: err => {
          expect(err).toMatchInlineSnapshot(`[Error: updateCustomer() cannot be called for a private customer)]`);
          done();
        },
      });

      verify(apiServiceMock.put(anything(), anything())).never();
    });

    it("should update the business customer when 'updateCustomer' is called", done => {
      when(apiServiceMock.put(anyString(), anything())).thenReturn(of({}));

      const customer = {
        customerNo: '4711',
        companyName: 'xyz',
        isBusinessCustomer: true,
      } as Customer;

      userService.updateCustomer(customer).subscribe(() => {
        verify(apiServiceMock.put('customers/-', anything())).once();
        done();
      });
    });
  });

  it("should get company user data when 'getCompanyUserData' is called", done => {
    const userData = {
      firstName: 'patricia',
    } as User;

    when(apiServiceMock.get('customers/-/users/-')).thenReturn(of(userData));

    userService.getCompanyUserData().subscribe(data => {
      expect(data.firstName).toEqual(userData.firstName);
      verify(apiServiceMock.get('customers/-/users/-')).once();
      done();
    });
  });

  describe('Confirm a data request', () => {
    it('should return an error when called with undefined', done => {
      when(apiServiceMock.put(anything(), anything())).thenReturn(of({}));

      userService.confirmGDPRDataRequest(undefined).subscribe({
        next: fail,
        error: err => {
          expect(err).toMatchInlineSnapshot(`[Error: confirmGDPRDataRequest() called without data body]`);
          done();
        },
      });

      verify(apiServiceMock.put(anything(), anything())).never();
    });

    it("should confirm data request when 'confirmDataRequest' is called", done => {
      const requestData = {
        requestID: 'test_ID',
        hash: 'test_hash',
      } as GDPRDataRequest;
      const payloadData = {
        infos: [{ causes: [{ code: 'already confirmed' }] } as GDPRDataRequestInfo],
      } as GDPRDataRequestData;

      when(apiServiceMock.put(anything(), anything(), anything())).thenReturn(of(payloadData));

      userService.confirmGDPRDataRequest(requestData).subscribe(payload => {
        verify(apiServiceMock.put('gdpr-requests/test_ID/confirmations', anything(), anything())).once();
        expect(capture(apiServiceMock.put).last()[0]).toMatchInlineSnapshot(`"gdpr-requests/test_ID/confirmations"`);
        expect(payload).toHaveProperty('infoCode', 'already confirmed');
        done();
      });
    });
  });

  describe('Cost Centers', () => {
    const customer: Customer = { customerNo: '123' };
    const user: User = {
      email: 'patricia@test.intershop.de',
      firstName: 'Patricia',
      lastName: 'Miller',
      login: 'patricia',
    };

    beforeEach(() => {
      store$.overrideSelector(getLoggedInUser, user);
      store$.overrideSelector(getLoggedInCustomer, customer);
      store$.overrideSelector(getUserPermissions, ['APP_B2B_VIEW_COSTCENTER']);

      when(apiServiceMock.get(anything())).thenReturn(of({}));
    });

    it("should get eligible cost centers for business user when 'getEligibleCostCenters' is called", done => {
      userService.getEligibleCostCenters().subscribe(() => {
        verify(
          apiServiceMock.get(`customers/${customer.customerNo}/users/${encodeResourceID(user.login)}/costcenters`)
        ).once();
        done();
      });
    });

    it("should get a cost center when 'getCostCenter' is called by a cost center admin", done => {
      userService.getCostCenter('12345').subscribe(() => {
        verify(apiServiceMock.get(`customers/${customer.customerNo}/costcenters/12345`)).once();
        done();
      });
    });
  });
});
