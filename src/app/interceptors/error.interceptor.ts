import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError(async (error) => {
      if (error) {
        switch (error.status) {
          case 401:
            await authService.logout();
            await router.navigate(['/login']);
            break;
        }
      }
      throw error;
    })
  );
};
