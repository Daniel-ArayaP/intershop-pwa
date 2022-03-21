import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { instance, mock } from 'ts-mockito';

import { ApiService } from 'ish-core/services/api/api.service';

import { PreviewService } from './preview.service';

describe('Preview Service', () => {
  let apiServiceMock: ApiService;
  let previewService: PreviewService;

  beforeEach(() => {
    apiServiceMock = mock(ApiService);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: ApiService, useFactory: () => instance(apiServiceMock) }, provideMockStore()],
    });
    previewService = TestBed.inject(PreviewService);
  });

  it('should be created', () => {
    expect(previewService).toBeTruthy();
  });
});
