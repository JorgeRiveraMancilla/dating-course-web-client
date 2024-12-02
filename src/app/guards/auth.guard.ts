import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const messageService = inject(MessageService);
  const authService = inject(AuthService);

  if (!authService.isAuthInitialized()) return false;
  else if (!authService.isAuthenticated()) {
    messageService.add({
      severity: 'error',
      summary: 'Acceso denegado',
      detail: 'Debes iniciar sesión para acceder a esta página',
    });
    router.navigate(['/login']);
    return false;
  }

  return true;
};
