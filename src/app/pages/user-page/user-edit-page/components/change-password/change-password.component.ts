import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, HostListener } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { finalize } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { HasUnsavedChanges } from '../../../../../guards/prevent-unsaved-changes.guard';
import { AuthService } from '../../../../../services/auth.service';
import { FormValidatorService } from '../../../../../services/form-validator.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-change-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    PasswordModule,
    ProgressSpinnerModule,
  ],
  standalone: true,
  templateUrl: './change-password.component.html',
  styles: [
    `
      :host ::ng-deep .custom-spinner .p-progress-spinner-circle {
        stroke: var(--primary-color);
        animation: custom-progress-spinner-dash 1.5s ease-in-out infinite;
      }
    `,
  ],
})
export class ChangePasswordComponent implements OnInit, HasUnsavedChanges {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);
  private readonly validatorService = inject(FormValidatorService);
  private readonly debounceMilliseconds = environment.debounceMilliseconds;
  private formChanged = false;
  private passwordChangeSuccessful = false;

  protected readonly passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        this.validatorService.alphanumeric(),
      ],
    ],
    confirmPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        this.validatorService.alphanumeric(),
        this.validatorService.passwordMatch('newPassword'),
      ],
    ],
  });
  protected loading = false;

  ngOnInit(): void {
    this.initializePasswordForm();
  }

  hasUnsavedChanges(): boolean {
    if (this.passwordChangeSuccessful) return false;

    if (!this.formChanged) return false;

    return Object.keys(this.passwordForm.value).some(
      (key) => this.passwordForm.value[key] !== ''
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: BeforeUnloadEvent) {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
    }
  }

  protected onPasswordSubmit(): void {
    if (this.passwordForm.invalid) return;

    this.loading = true;
    const passwordData = this.passwordForm.value;

    this.authService
      .changePassword(passwordData)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.passwordChangeSuccessful = true;
          this.formChanged = false;
          this.passwordForm.reset();

          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail:
              'Contraseña actualizada correctamente. Por favor, inicia sesión nuevamente.',
            life: this.debounceMilliseconds,
          });

          setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/']);
          }, 1500);
        },
        error: (error: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.error || 'Error al actualizar la contraseña',
            life: this.debounceMilliseconds,
          });
        },
      });
  }

  protected getFieldError(form: FormGroup, fieldName: string): string {
    const control = form.get(fieldName);

    if (!control || !control.errors || !control.touched) return '';

    const errors = {
      required: 'Este campo es requerido',
      minlength: `Mínimo ${control.errors['minlength']?.requiredLength} caracteres`,
      maxlength: `Máximo ${control.errors['maxlength']?.requiredLength} caracteres`,
      alphanumeric: 'Solo se permiten letras y números',
      passwordMatch: 'Las contraseñas no coinciden',
    };

    const firstError = Object.keys(control.errors)[0];
    return errors[firstError as keyof typeof errors] || 'Campo inválido';
  }

  private initializePasswordForm(): void {
    this.passwordForm.controls['newPassword'].valueChanges.subscribe(() => {
      this.passwordForm.controls['confirmPassword'].updateValueAndValidity();
    });

    this.passwordForm.valueChanges.subscribe(() => {
      if (!this.passwordChangeSuccessful) {
        const hasChanges = Object.keys(this.passwordForm.value).some(
          (key) => this.passwordForm.value[key] !== ''
        );
        this.formChanged = hasChanges;
      }
    });
  }
}
