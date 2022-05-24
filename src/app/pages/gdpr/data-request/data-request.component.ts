import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccountFacade } from 'ish-core/facades/account.facade';
import { HttpError } from 'ish-core/models/http-error/http-error.model';

/**
 * The Personal Data Request Confirmation Component handles the interaction for dispatching of a confirmation request triggered via confirmation email link.
 */
@Component({
  selector: 'ish-data-request',
  templateUrl: './data-request.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataRequestComponent implements OnInit, OnDestroy {
  successStatus$: Observable<number>;
  loading$: Observable<boolean>;
  error$: Observable<HttpError>;

  requestID: string;
  secureCode: string;
  test: string;

  errorTranslationCode: string;

  private destroy$ = new Subject<void>();

  constructor(private accountFacade: AccountFacade, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.error$ = this.accountFacade.confirmationError$;
    this.loading$ = this.accountFacade.confirmationLoading$;

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: { PersonalDataRequestID: string; Hash: string }) => {
        this.requestID = params.PersonalDataRequestID;
        this.secureCode = params.Hash;
      });
    this.successStatus$ = this.accountFacade.confirmDataRequest({ hash: this.secureCode, requestID: this.requestID });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isSuccess(httpStatus: number) {
    return httpStatus === 204;
  }
}
