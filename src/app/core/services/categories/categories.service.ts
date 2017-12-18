import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { categoryFromRaw } from '../../../models/category/category.factory';
import { RawCategory } from '../../../models/category/category.interface';
import { Category } from '../../../models/category/category.model';
import { ApiService } from '../api.service';

@Injectable()
export class CategoriesService {

  private serviceIdentifier = 'categories';

  constructor(
    private apiService: ApiService
  ) { }

  /**
   * REST API - Get top level categories
   * @param limit  The number of levels to be returned (depth) in hierarchical view.
   * @returns      List of top level categories.
   */
  getTopLevelCategories(limit: number): Observable<Category[]> {
    let params = new HttpParams().set('imageView', 'NO-IMAGE');
    if (limit > 0) {
      params = params.set('view', 'tree').set('limit', limit.toString());
    }
    const rawCategories$ = this.apiService.get<RawCategory[]>(this.serviceIdentifier, params, null, true);
    if (rawCategories$) {
      return rawCategories$.map(
        (rawCategoryArray: RawCategory[]) => {
          return rawCategoryArray.map(
            (rowCategory: RawCategory) => categoryFromRaw(rowCategory));
        }
      );
    }
  }

  /**
   * REST API - Get info on (sub-)category
   * @param categoryId  The category id path for the category of interest.
   * @returns           Category information.
   */
  getCategory(categoryId: string): Observable<Category> {
    if (!categoryId) {
      return ErrorObservable.create('getCategory() called without categoryId');
    }
    const rawCategories$ = this.apiService.get<RawCategory>(this.serviceIdentifier + '/' + categoryId, null, null, false);
    return rawCategories$.map(rawCategory => categoryFromRaw(rawCategory));
  }


  // TODO: this method should become obsolete as soon as the category REST call will return the category path too
  /**
   * Helper function to get the category path for a given category with the help of the current route.
   * @param category        The category the category path should be gotten for.
   * @param activatedRoute  The currently activated route that is used to determine the category path.
   * @returns               A Category array that represents the category path from root to the category.
   */
  getCategoryPath(category: Category, activatedRoute: ActivatedRouteSnapshot): Observable<Category[]> {
    if (!category || !activatedRoute || !activatedRoute.url) {
      return ErrorObservable.create('getCategoryPath cannot act with missing or empty category or route snapshot');
    }

    const observableArray: Observable<Category>[] = [];
    let categoryId = '';

    for (const urlSegment of activatedRoute.url) {
      if (urlSegment.path === category.id) {
        observableArray.push(Observable.of(category));
      } else {
        categoryId = categoryId + urlSegment.path;
        observableArray.push(this.getCategory(categoryId));
        categoryId = categoryId + '/';
      }
    }
    return forkJoin(observableArray);
  }

  /**
   * Helper function to compare two categories
   * @param category1  The first category to be compared with the second.
   * @param category2  The second category to be compared with the first.
   * @returns          True if the categories are equal, false if not.
   *                   'equal' means
   *                   - both categories are defined
   *                   - the id of the categories is the same
   */
  isCategoryEqual(category1: Category, category2: Category): boolean {
    return !!category1 && !!category2 && category1.id === category2.id;
  }

  /**
   * Helper function to generate the applications category route from the categories REST API uri
   * or alternatively from an additionally given categoryPath if no uri is available.
   * @param category      [required] The category the application route should be generated for.
   * @param categoryPath  [optional] The category path from root to the category as Category array. - This should be obsolete once the category REST call provided the category path itself.
   * @returns             The application /category route string for the given category.
   */
  generateCategoryRoute(category: Category, categoryPath?: Category[]): string {
    let categoryIdPath = '';
    let categoryIdPathIsValid = false;
    if (category) {
      if (category.uri) {
        categoryIdPath = category.uri.split(/\/categories[^\/]*/)[1];
        categoryIdPathIsValid = true;
      } else if (categoryPath && categoryPath.length) {
        for (const pathCategory of categoryPath) {
          categoryIdPath = categoryIdPath + '/' + pathCategory.id;
          if (!!pathCategory && this.isCategoryEqual(pathCategory, category)) {
            categoryIdPathIsValid = true;
            break;
          }
        }
      }
    }
    if (categoryIdPath && categoryIdPathIsValid) {
      return '/category' + categoryIdPath;
    } else {
      return '';
    }
  }
}
