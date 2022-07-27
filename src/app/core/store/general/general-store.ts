import { createFeatureSelector } from '@ngrx/store';

import { CountriesState } from './countries/countries.reducer';
import { GDPRDataRequestState } from './gdpr-data-request/gdpr-data-request.reducer';
import { RegionsState } from './regions/regions.reducer';

export interface GeneralState {
  countries: CountriesState;
  regions: RegionsState;
  confirmations: GDPRDataRequestState;
}

export const getGeneralState = createFeatureSelector<GeneralState>('general');
