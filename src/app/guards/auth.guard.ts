import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastStateService } from '../services/toast-state.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const toastStateService = inject(ToastStateService);

  if (authService.isAuthenticated()) {
    toastStateService.resetToastState();
    return true;
  }

  toastStateService.showToastOnce(
    'warn',
    'Acceso denegado',
    'Debes iniciar sesión para acceder a esta página',
    3000
  );

  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });

  return false;
};
