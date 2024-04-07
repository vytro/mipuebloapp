import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { BehaviorSubject, EMPTY, Observable, catchError, switchMap, throwError } from 'rxjs';
import { Key } from '../enum/key.enum';
import { UserService } from '../service/user.service';
import { CustomHttpResponse, Profile } from '../interface/appstates';

// @Injectable({ providedIn: 'root' })
@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private isTokenRefreshing: boolean = false;
  // private refreshTokenSubject: BehaviorSubject<CustomHttpResponse<Profile>> = new BehaviorSubject(null);
  private refreshTokenSubject: BehaviorSubject<CustomHttpResponse<Profile> | null> = new BehaviorSubject<CustomHttpResponse<Profile> | null>(null);

  constructor(private userService: UserService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>>
    | Observable<HttpResponse<unknown>> {
    // ignore the request if it's for login, register, refresh or resetpassword
    // can check the entire url with === instead of includes()
    if (request.url.includes('verify')
      || request.url.includes('login')
      || request.url.includes('register')
      || request.url.includes('refresh')
      || request.url.includes('resetpassword')) {
      return next.handle(request);
    }

    // get the token from the local storage
    return next.handle(this.addAuthorizationTokenHeader(request, localStorage.getItem(Key.TOKEN)))
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error instanceof HttpErrorResponse && error.status === 401 && error.error.reason.includes('expired')) {
            return this.handleRefreshToken(request, next);
          } else {
            return throwError(() => error);
          }
        })
      );
  }

  private handleRefreshToken(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isTokenRefreshing) {
      console.log('refreshing token');
      this.isTokenRefreshing = true;
      this.refreshTokenSubject.next(null);
      return this.userService.refreshToken$().pipe(
        switchMap((response) => {
          console.log('token refresh response: ', response);
          this.isTokenRefreshing = false;
          this.refreshTokenSubject.next(response);
          console.log('new token: ', response.data?.access_token ?? '');
          console.log('sending original request: ', request);
          return next.handle(this.addAuthorizationTokenHeader(request, response.data?.access_token ?? ''));
        })
      );
    } else {
      this.refreshTokenSubject.pipe(
        switchMap((response) => {
          return next.handle(this.addAuthorizationTokenHeader(request, response?.data?.access_token ?? ''));
        })
      )
    }
    // return next.handle(request);
    return EMPTY;
  }

  private addAuthorizationTokenHeader(request: HttpRequest<unknown>, token: string | null): HttpRequest<any> {
    return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
}
