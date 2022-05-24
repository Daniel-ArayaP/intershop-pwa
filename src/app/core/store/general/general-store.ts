import { createFeatureSelector } from '@ngrx/store';

import { CountriesState } from './countries/countries.reducer';
import { DataRequestState } from './data-request/data-request.reducer';
import { RegionsState } from './regions/regions.reducer';

export interface GeneralState {
  countries: CountriesState;
  regions: RegionsState;
  confirmations: DataRequestState;
}

export const getGeneralState = createFeatureSelector<GeneralState>('general');
