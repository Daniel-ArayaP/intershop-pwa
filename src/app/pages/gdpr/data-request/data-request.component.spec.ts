import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import { EMPTY } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';

import { AccountFacade } from 'ish-core/facades/account.facade';
import { ErrorMessageComponent } from 'ish-shared/components/common/error-message/error-message.component';

import { DataRequestComponent } from './data-request.component';

describe('Data Request Component', () => {
  let component: DataRequestComponent;
  let fixture: ComponentFixture<DataRequestComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    const accountFacade = mock(AccountFacade);
    when(accountFacade.passwordReminderSuccess$).thenReturn(EMPTY);

    await TestBed.configureTestingModule({
      declarations: [DataRequestComponent, MockComponent(ErrorMessageComponent)],
      imports: [RouterTestingModule, TranslateModule.forRoot()],
      providers: [{ provide: AccountFacade, useFactory: () => instance(accountFacade) }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataRequestComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
