import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { AccountFacade } from 'ish-core/facades/account.facade';
import { HttpError } from 'ish-core/models/http-error/http-error.model';

/**
 * The Personal Data Request Confirmation Component handles the interaction for dispatching of a confirmation request triggered via confirmation email link.
 */
@Component({
  selector: 'ish-data-request',
  templateUrl: './gdpr-data-request.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GDPRDataRequestComponent implements OnInit {
  loading$: Observable<boolean>;
  error$: Observable<HttpError>;
  firstTimeRequest$: Observable<boolean>;

  constructor(private accountFacade: AccountFacade) {}

  ngOnInit(): void {
    this.error$ = this.accountFacade.gdprConfirmationError$;
    this.loading$ = this.accountFacade.gdprConfirmationLoading$;
    this.firstTimeRequest$ = this.accountFacade.isFirstTimeGDPRDataRequest$;
  }
}
