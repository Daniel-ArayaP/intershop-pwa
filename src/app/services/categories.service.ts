import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Category } from './category';
import { CATEGORIES } from './mock-categories';

@Injectable()
export class CategoriesService {

  private categoriesUrl = 'api/categories';  // URL to web api

  constructor(private http: Http) {}

  getCategories(): Promise<Category[]> {
  return this.http.get(this.categoriesUrl)
             .toPromise()
             .then(response => response.json().data as Category[])
             .catch(this.handleError);
  }

  getCategory(id: string): Promise<Category> {
    const url = `${this.categoriesUrl}/${id}`;
    return this.http.get(url)
      .toPromise()
      .then(response => response.json().data as Category)
      .catch(this.handleError);
  }
  
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
