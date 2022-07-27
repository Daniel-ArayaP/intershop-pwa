import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccountFacade } from 'ish-core/facades/account.facade';
import { GDPRDataRequest } from 'ish-core/models/gdpr-data-request/gdpr-data-request.model';
import { HttpError } from 'ish-core/models/http-error/http-error.model';

/**
 * The Personal Data Request Confirmation Component handles the interaction for dispatching of a confirmation request triggered via confirmation email link.
 */
@Component({
  selector: 'ish-data-request',
  templateUrl: './gdpr-data-request.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GDPRDataRequestComponent implements OnInit, OnDestroy {
  dataRequest$: Observable<GDPRDataRequest>;
  loading$: Observable<boolean>;
  error$: Observable<HttpError>;
  firstTime$: Observable<boolean>;

  requestID: string;
  secureCode: string;
  firstTime1: boolean;

  errorTranslationCode: string;

  private destroy$ = new Subject<void>();

  constructor(private accountFacade: AccountFacade, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.error$ = this.accountFacade.gdprConfirmationError$;
    this.loading$ = this.accountFacade.gdprConfirmationLoading$;
    this.firstTime$ = this.accountFacade.isFirstTime$;

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: { PersonalDataRequestID: string; Hash: string }) => {
        this.requestID = params.PersonalDataRequestID;
        this.secureCode = params.Hash;
      });
    // confirmation of the personal data request
    this.accountFacade.confirmGDPRDataRequest({ hash: this.secureCode, requestID: this.requestID });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
