import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const messageService = inject(MessageService);
  const authService = inject(AuthService);

  await authService.initializeAuth();

  const auth = authService.getCurrentAuth();

  if (auth === null) {
    messageService.add({
      severity: 'error',
      summary: 'Acceso denegado',
      detail: 'Debes iniciar sesión para acceder a esta página',
    });

    await router.navigate(['/login']);

    return false;
  }

  const token = auth.token;
  if (!token) {
    authService.logout();
    messageService.add({
      severity: 'error',
      summary: 'Sesión expirada',
      detail: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente',
    });

    await router.navigate(['/login']);
    return false;
  }

  return true;
};
