import { createReducer, on } from '@ngrx/store';

import { ContentPageTreeHelper } from 'ish-core/models/content-page-tree/content-page-tree.helper';
import { ContentPageTree } from 'ish-core/models/content-page-tree/content-page-tree.model';

import { loadContentPageTreeSuccess } from './page-tree.actions';

export interface PageTreeState {
  pagetree: ContentPageTree;
}

const initialState: PageTreeState = {
  pagetree: ContentPageTreeHelper.empty(),
};

export const pageTreeReducer = createReducer(
  initialState,
  on(loadContentPageTreeSuccess, (state, action): PageTreeState => {
    const { pagetree } = action.payload;

    return {
      ...state,
      pagetree,
    };
  })
);
