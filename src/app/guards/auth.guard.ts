import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';

export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const messageService = inject(MessageService);

  if (authService.isAuthenticated()) {
    return true;
  }

  messageService.add({
    severity: 'warn',
    summary: 'Acceso denegado',
    detail: 'Debes iniciar sesión para acceder a esta página',
    life: 3000,
  });

  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });

  return false;
};
