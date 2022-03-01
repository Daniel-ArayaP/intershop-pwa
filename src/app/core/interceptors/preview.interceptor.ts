import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, filter, map, take } from 'rxjs';

/**
 * add PreviewContextID to every request if it is available in the SessionStorage
 */
@Injectable()
export class PreviewInterceptor implements HttpInterceptor {
  constructor(private route: ActivatedRoute) {
    this.route.queryParams
      .pipe(
        filter(params => params.PreviewContextID),
        map(params => params.PreviewContextID),
        take(1)
        // TODO: end listening for PreviewContextID if there is no such parameter at the first initialization
      )
      .subscribe(value => {
        if (!sessionStorage.getItem('PreviewContextID')) {
          sessionStorage.setItem('PreviewContextID', value);
        }
      });
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const previewContextID = sessionStorage.getItem('PreviewContextID');

    if (previewContextID) {
      return next.handle(
        req.clone({
          url: `${req.url};prectx=${previewContextID}`,
        })
      );
    }

    return next.handle(req);
  }
}
