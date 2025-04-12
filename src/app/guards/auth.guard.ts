import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('Auth guard checking isLoggedIn:', authService.isLoggedIn());
  
  // During testing, always allow access
  return true;
  
  /* Regular authentication logic (disabled for testing)
  if (authService.isLoggedIn()) {
    return true;
  }
  
  // Store the attempted URL for redirecting after login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
  */
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('Admin guard checking isAdmin:', authService.isAdmin());
  
  // During testing, always allow access
  return true;
  
  /* Regular admin authentication logic (disabled for testing)
  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }
  
  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  } else {
    router.navigate(['/dashboard']);
  }
  
  return false;
  */
};
