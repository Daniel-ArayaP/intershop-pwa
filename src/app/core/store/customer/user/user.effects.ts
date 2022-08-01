import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { routerNavigatedAction } from '@ngrx/router-store';
import { Store, select } from '@ngrx/store';
import { OAuthInfoEvent, OAuthService } from 'angular-oauth2-oidc';
import { from } from 'rxjs';
import {
  concatMap,
  delay,
  exhaustMap,
  filter,
  map,
  mergeMap,
  sample,
  switchMap,
  takeWhile,
  withLatestFrom,
} from 'rxjs/operators';

import { CustomerRegistrationType } from 'ish-core/models/customer/customer.model';
import { PaymentService } from 'ish-core/services/payment/payment.service';
import { UserService } from 'ish-core/services/user/user.service';
import { displaySuccessMessage } from 'ish-core/store/core/messages';
import { selectQueryParam, selectUrl } from 'ish-core/store/core/router';
import { ApiTokenService } from 'ish-core/utils/api-token/api-token.service';
import { OAuthConfigurationService } from 'ish-core/utils/oauth-configuration/oauth-configuration.service';
import { mapErrorToAction, mapToPayload, mapToPayloadProperty, whenTruthy } from 'ish-core/utils/operators';

import { getPGID, personalizationStatusDetermined } from '.';
import {
  createUser,
  createUserFail,
  deleteUserPaymentInstrument,
  deleteUserPaymentInstrumentFail,
  deleteUserPaymentInstrumentSuccess,
  loadCompanyUser,
  loadCompanyUserFail,
  loadCompanyUserSuccess,
  loadUserByAPIToken,
  loadUserCostCenters,
  loadUserCostCentersFail,
  loadUserCostCentersSuccess,
  loadUserPaymentMethods,
  loadUserPaymentMethodsFail,
  loadUserPaymentMethodsSuccess,
  loginUser,
  loginUserFail,
  loginUserSuccess,
  loginUserWithToken,
  requestPasswordReminder,
  requestPasswordReminderFail,
  requestPasswordReminderSuccess,
  updateCustomer,
  updateCustomerFail,
  updateCustomerSuccess,
  updateUser,
  updateUserFail,
  updateUserPassword,
  updateUserPasswordByPasswordReminder,
  updateUserPasswordByPasswordReminderFail,
  updateUserPasswordByPasswordReminderSuccess,
  updateUserPasswordFail,
  updateUserPasswordSuccess,
  updateUserPreferredPayment,
  updateUserSuccess,
  userErrorReset,
  fetchAnonymousUserToken,
} from './user.actions';
import { getLoggedInCustomer, getLoggedInUser, getUserError } from './user.selectors';

@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private store: Store,
    private userService: UserService,
    private paymentService: PaymentService,
    private router: Router,
    private apiTokenService: ApiTokenService,
    private oAuthService: OAuthService,
    oAuthConfigurationService: OAuthConfigurationService
  ) {
    oAuthConfigurationService.config$.subscribe(config => this.oAuthService.configure(config));
  }

  loginUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginUser),
      mapToPayloadProperty('credentials'),
      exhaustMap(credentials =>
        this.userService.fetchToken('password', { username: credentials.login, password: credentials.password }).pipe(
          map(tokenResponse => this.apiTokenService.setApiToken(tokenResponse.access_token)),
          switchMap(() =>
            this.userService.fetchCustomer().pipe(map(loginUserSuccess), mapErrorToAction(loginUserFail))
          ),
          mapErrorToAction(loginUserFail)
        )
      )
    )
  );

  fetchAnonymousUserToken$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(fetchAnonymousUserToken),
        switchMap(() => this.userService.fetchToken('anonymous')),
        map(tokenResponse => this.apiTokenService.setApiToken(tokenResponse.access_token))
      ),
    { dispatch: false }
  );

  refreshUserToken$ = createEffect(
    () =>
      this.oAuthService.events.pipe(
        filter(
          event => event instanceof OAuthInfoEvent && event.type === 'token_expires' && event.info === 'access_token'
        ),
        switchMap(() => from(this.oAuthService.refreshToken()))
      ),
    { dispatch: false }
  );

  loginUserWithToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginUserWithToken),
      mapToPayloadProperty('token'),
      exhaustMap(token =>
        this.userService.signInUserByToken(token).pipe(map(loginUserSuccess), mapErrorToAction(loginUserFail))
      )
    )
  );

  loadCompanyUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCompanyUser),
      mergeMap(() =>
        this.userService.getCompanyUserData().pipe(
          map(user => loadCompanyUserSuccess({ user })),
          mapErrorToAction(loadCompanyUserFail)
        )
      )
    )
  );

  /**
   * redirects to the returnUrl after successful login
   * does not redirect at all, if no returnUrl is defined
   */
  redirectAfterLogin$ = createEffect(
    () =>
      this.store.pipe(select(selectQueryParam('returnUrl'))).pipe(
        takeWhile(() => !SSR),
        whenTruthy(),
        sample(this.actions$.pipe(ofType(loginUserSuccess))),
        concatMap(navigateTo => from(this.router.navigateByUrl(navigateTo)))
      ),
    { dispatch: false }
  );

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createUser),
      mapToPayload(),
      mergeMap((data: CustomerRegistrationType) =>
        this.userService.createUser(data).pipe(map(loginUserSuccess), mapErrorToAction(createUserFail))
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUser),
      mapToPayload(),
      withLatestFrom(this.store.pipe(select(getLoggedInCustomer))),
      concatMap(([{ user, credentials, successMessage }, customer]) =>
        this.userService.updateUser({ user, customer }, credentials).pipe(
          map(changedUser => updateUserSuccess({ user: changedUser, successMessage })),
          mapErrorToAction(updateUserFail)
        )
      )
    )
  );

  updateUserPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUserPassword),
      mapToPayload(),
      withLatestFrom(this.store.pipe(select(getLoggedInCustomer))),
      withLatestFrom(this.store.pipe(select(getLoggedInUser))),
      concatMap(([[payload, customer], user]) =>
        this.userService.updateUserPassword(customer, user, payload.password, payload.currentPassword).pipe(
          map(() =>
            updateUserPasswordSuccess({
              successMessage: payload.successMessage || { message: 'account.profile.update_password.message' },
            })
          ),
          mapErrorToAction(updateUserPasswordFail)
        )
      )
    )
  );

  updateCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateCustomer),
      mapToPayload(),
      withLatestFrom(this.store.pipe(select(getLoggedInCustomer))),
      filter(([, loggedInCustomer]) => !!loggedInCustomer && loggedInCustomer.isBusinessCustomer),
      concatMap(([{ customer, successMessage }]) =>
        this.userService.updateCustomer(customer).pipe(
          map(changedCustomer => updateCustomerSuccess({ customer: changedCustomer, successMessage })),
          mapErrorToAction(updateCustomerFail)
        )
      )
    )
  );

  redirectAfterUpdateOnProfileSettings$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(updateUserSuccess, updateCustomerSuccess, updateUserPasswordSuccess),
        withLatestFrom(this.store.pipe(select(selectUrl))),
        filter(([, url]) => url.includes('/account/profile')),
        concatMap(() => from(this.router.navigateByUrl('/account/profile')))
      ),
    { dispatch: false }
  );

  displayUpdateUserSuccessMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUserPasswordSuccess, updateUserSuccess, updateCustomerSuccess),
      mapToPayloadProperty('successMessage'),
      filter(successMessage => !!successMessage),
      map(displaySuccessMessage)
    )
  );

  resetUserError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(routerNavigatedAction),
      withLatestFrom(this.store.pipe(select(getUserError))),
      filter(([, error]) => !!error),
      map(() => userErrorReset())
    )
  );

  loadCompanyUserAfterLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginUserSuccess),
      mapToPayload(),
      filter(payload => payload.customer.isBusinessCustomer),
      map(() => loadCompanyUser())
    )
  );

  loadUserByAPIToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUserByAPIToken),
      concatMap(() => this.userService.signInUserByToken().pipe(map(loginUserSuccess), mapErrorToAction(loginUserFail)))
    )
  );

  /**
   * This effect emits the 'personalizationStatusDetermined' action once the PGID is fetched or there is no user apiToken cookie,
   */
  determinePersonalizationStatus$ = createEffect(() =>
    this.store.pipe(
      select(getPGID),
      map(pgid => !this.apiTokenService.hasUserApiTokenCookie() || pgid),
      whenTruthy(),
      delay(100),
      map(() => personalizationStatusDetermined())
    )
  );

  loadUserCostCenters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUserCostCenters),
      withLatestFrom(this.store.pipe(select(getLoggedInCustomer))),
      filter(([, loggedInCustomer]) => !!loggedInCustomer && loggedInCustomer.isBusinessCustomer),
      mergeMap(() =>
        this.userService.getEligibleCostCenters().pipe(
          map(costCenters => loadUserCostCentersSuccess({ costCenters })),
          mapErrorToAction(loadUserCostCentersFail)
        )
      )
    )
  );

  loadUserPaymentMethods$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUserPaymentMethods),
      withLatestFrom(this.store.pipe(select(getLoggedInCustomer))),
      filter(([, customer]) => !!customer),
      concatMap(([, customer]) =>
        this.paymentService.getUserPaymentMethods(customer).pipe(
          map(result => loadUserPaymentMethodsSuccess({ paymentMethods: result })),
          mapErrorToAction(loadUserPaymentMethodsFail)
        )
      )
    )
  );

  deleteUserPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteUserPaymentInstrument),
      mapToPayload(),
      withLatestFrom(this.store.pipe(select(getLoggedInCustomer))),
      filter(([, customer]) => !!customer),
      concatMap(([payload, customer]) =>
        this.paymentService.deleteUserPaymentInstrument(customer.customerNo, payload.id).pipe(
          mergeMap(() => [
            deleteUserPaymentInstrumentSuccess(),
            loadUserPaymentMethods(),
            displaySuccessMessage(payload.successMessage),
          ]),
          mapErrorToAction(deleteUserPaymentInstrumentFail)
        )
      )
    )
  );

  /**
   * Creates a payment instrument for an unparametrized payment method (like invoice)  and assigns it as preferred instrument at the user.
   * This is necessary due to limitations of the payment user REST interface.
   */
  updatePreferredUserPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUserPreferredPayment),
      mapToPayload(),
      withLatestFrom(this.store.pipe(select(getLoggedInCustomer))),
      filter(([, customer]) => !!customer),
      concatMap(([payload, customer]) =>
        this.paymentService
          .createUserPayment(customer.customerNo, { id: undefined, paymentMethod: payload.paymentMethodId })
          .pipe(
            mergeMap(pi => [
              updateUser({
                user: { ...payload.user, preferredPaymentInstrumentId: pi.id },
                successMessage: payload.successMessage,
              }),
              loadUserPaymentMethods(),
            ]),
            mapErrorToAction(updateUserFail)
          )
      )
    )
  );

  requestPasswordReminder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(requestPasswordReminder),
      mapToPayloadProperty('data'),
      concatMap(data =>
        this.userService
          .requestPasswordReminder(data)
          .pipe(map(requestPasswordReminderSuccess), mapErrorToAction(requestPasswordReminderFail))
      )
    )
  );

  updateUserPasswordByPasswordReminder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUserPasswordByPasswordReminder),
      mapToPayload(),
      concatMap(data =>
        this.userService
          .updateUserPasswordByReminder(data)
          .pipe(
            map(updateUserPasswordByPasswordReminderSuccess),
            mapErrorToAction(updateUserPasswordByPasswordReminderFail)
          )
      )
    )
  );

  updateUserPasswordByPasswordReminderSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUserPasswordByPasswordReminderSuccess),
      map(() =>
        displaySuccessMessage({
          message: 'account.profile.update_password.message',
        })
      )
    )
  );
}
