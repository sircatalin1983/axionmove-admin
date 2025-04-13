import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the token from localStorage
    const token = localStorage.getItem('auth_token');
    console.log('AuthInterceptor - Token:', token ? 'Present' : 'Missing');
    console.log('AuthInterceptor - Request URL:', request.url);
    
    let clonedRequest = request;
    
    // Clone the request and add the authorization header if token exists
    if (token) {
      clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('AuthInterceptor - Added Authorization header');
    }
    
    // Add content type header if not present
    if (!clonedRequest.headers.has('Content-Type')) {
      clonedRequest = clonedRequest.clone({
        setHeaders: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Add Accept header if not present
    if (!clonedRequest.headers.has('Accept')) {
      clonedRequest = clonedRequest.clone({
        setHeaders: {
          Accept: 'application/json'
        }
      });
    }

    console.log('AuthInterceptor - Final Headers:', clonedRequest.headers.keys());
    
    // Pass the cloned request with the headers to the next handler
    return next.handle(clonedRequest).pipe(
      tap(response => {
        console.log('AuthInterceptor - Response:', response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('AuthInterceptor - Error:', error);
        if (error.status === 401 || error.status === 403) {
          console.log('AuthInterceptor - Unauthorized/Forbidden, redirecting to login');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
} 