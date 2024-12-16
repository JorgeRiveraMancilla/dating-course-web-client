import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { ConfirmationService } from 'primeng/api';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const preventUnsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (
  component
) => {
  if (!component.hasUnsavedChanges()) return true;

  const confirmationService = inject(ConfirmationService);

  return new Promise((resolve) => {
    confirmationService.confirm({
      header: 'Cambios no guardados',
      message: '¿Desea descartar los cambios no guardados?',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      acceptButtonStyleClass: 'p-button-text',
      acceptLabel: 'Sí',
      rejectIcon: 'none',
      rejectLabel: 'No',
      accept: () => resolve(true),
      reject: () => resolve(false),
    });
  });
};
