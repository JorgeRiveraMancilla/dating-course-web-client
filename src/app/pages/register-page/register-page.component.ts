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
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RegisterDto } from '../../interfaces/register-dto';
import { RegisterForm } from '../../interfaces/register-form';
import { AuthService } from '../../services/auth.service';
import { FormValidatorService } from '../../services/form-validator.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    CalendarModule,
    DropdownModule,
    ButtonModule,
    ToastModule,
    RouterModule,
  ],
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly validatorService = inject(FormValidatorService);

  private readonly debounceMilliseconds = environment.debounceMilliseconds;

  protected readonly genderOptions: {
    label: string;
    value: string;
  }[] = [
    { label: 'Masculino', value: 'male' },
    { label: 'Femenino', value: 'female' },
  ];
  protected readonly maxDate = new Date();

  protected readonly registerForm: FormGroup = this.fb.group({
    userName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    knownAs: ['', [Validators.required, Validators.minLength(3)]],
    gender: ['', Validators.required],
    birthDate: [null as Date | null, Validators.required],
    city: ['', Validators.required],
    country: ['', Validators.required],
    password: [
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
        this.validatorService.passwordMatch('password'),
      ],
    ],
  });
  protected loading = false;

  protected onSubmit(): void {
    if (this.registerForm.invalid) return;

    const formValue = this.registerForm.value as RegisterForm;
    const registerData: RegisterDto = {
      userName: formValue.userName.trim(),
      email: formValue.email.trim().toLowerCase(),
      knownAs: formValue.knownAs.trim(),
      gender: formValue.gender,
      birthDate: formValue.birthDate!.toISOString().split('T')[0],
      city: formValue.city.trim(),
      country: formValue.country.trim(),
      password: formValue.password,
      confirmPassword: formValue.confirmPassword,
    };

    this.loading = true;

    this.authService
      .register(registerData)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Registro exitoso',
            life: this.debounceMilliseconds,
          });
          this.router.navigate(['/login']);
        },
        error: (error: HttpErrorResponse) =>
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.error || 'Error al registrarse',
            life: this.debounceMilliseconds,
          }),
      });
  }

  protected getFieldError(fieldName: keyof RegisterForm): string {
    const control = this.registerForm.get(fieldName);

    if (!control || !control.errors || !control.touched) return '';

    const errors = {
      required: 'Este campo es requerido',
      email: 'Correo electrónico inválido',
      minlength: `Mínimo ${control.errors['minlength']?.requiredLength} caracteres`,
      maxlength: `Máximo ${control.errors['maxlength']?.requiredLength} caracteres`,
      alphanumeric: 'Solo se permiten letras y números',
      passwordMatch: 'Las contraseñas no coinciden',
    };

    const firstError = Object.keys(control.errors)[0];
    return errors[firstError as keyof typeof errors] || 'Campo inválido';
  }
}
