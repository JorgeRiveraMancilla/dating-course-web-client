import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { environment } from '../../../environments/environment';
import { LoginForm } from '../../interfaces/login-form';
import { AuthService } from '../../services/auth.service';
import { FormValidatorService } from '../../services/form-validator.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
    RouterModule,
  ],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly validatorService = inject(FormValidatorService);

  private readonly debounceMilliseconds = environment.debounceMilliseconds;

  protected readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        this.validatorService.alphanumeric(),
      ],
    ],
  });
  protected loading = false;

  protected async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;

    const formValue = this.loginForm.value as LoginForm;
    const loginData: LoginForm = {
      email: formValue.email.trim().toLowerCase(),
      password: formValue.password,
    };

    this.loading = true;

    try {
      await this.authService.login(loginData);

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Inicio de sesión exitoso',
        life: this.debounceMilliseconds,
      });

      this.router.navigate(['/']);
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          error instanceof HttpErrorResponse
            ? error.error?.error || 'Error al iniciar sesión'
            : 'Error al iniciar sesión',
        life: this.debounceMilliseconds,
      });
    } finally {
      this.loading = false;
    }
  }

  protected getFieldError(fieldName: keyof LoginForm): string {
    const control = this.loginForm.get(fieldName);

    if (!control || !control.errors || !control.touched) return '';

    const errors = {
      required: 'Este campo es requerido',
      email: 'Correo electrónico inválido',
      minlength: `Mínimo ${control.errors['minlength']?.requiredLength} caracteres`,
      maxlength: `Máximo ${control.errors['maxlength']?.requiredLength} caracteres`,
      alphanumeric: 'Solo se permiten letras y números',
    };

    const firstError = Object.keys(control.errors)[0];
    return errors[firstError as keyof typeof errors] || 'Campo inválido';
  }
}
