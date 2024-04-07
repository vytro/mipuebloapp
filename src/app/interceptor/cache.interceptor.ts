import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { HttpCacheService } from '../service/http.cache.service';
// @Injectable({ providedIn: 'root' })
@Injectable()
export class CacheInterceptor implements HttpInterceptor {

  constructor(private httpCache: HttpCacheService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>>
    | Observable<HttpResponse<unknown>> {

    console.log('request.method: ' + request.method);//addded
    // ignore the request if it's for login, register, refresh or resetpassword
    // can check the entire url with === instead of includes()
    if (request.url.includes('verify')
      // || request.url.includes('login')
      || request.url.includes('register')
      || request.url.includes('refresh')
      || request.url.includes('resetpassword')
      || request.url.includes('verify')
      || request.url.includes('new/password')) {
      return next.handle(request);
    }

    //or add ||request.url.includes('login') to the if statement
    if (request.method !== 'GET' || request.url.includes('download')) {
      this.httpCache.evictAll();
      // this.httpCache.evict(request.url);
      return next.handle(request);
    }

    const cachedResponse: HttpResponse<any> | null | undefined = this.httpCache.get(request.url);
    if (cachedResponse) {
      console.log('found response in cache', cachedResponse);
      this.httpCache.logCache();
      return of(cachedResponse);
    }

    // obligated
    // return next.handle(request);
    //return EMPTY;
    return this.handleRequestCache(request, next);
  }

  private handleRequestCache(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap(response => {
        if (response instanceof HttpResponse && request.method !== 'DELETE') {
          console.log('caching response', response);
          this.httpCache.put(request.url, response); //request.url is the key
          this.httpCache.logCache();
        }
      })
    );
  }
}
