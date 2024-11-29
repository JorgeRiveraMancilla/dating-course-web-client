import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormGroup,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../services/auth.service';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { RegisterDto } from '../../interfaces/register-dto';

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
  styles: ``,
})
export class RegisterPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  loading = signal(false);
  maxDate = new Date();

  genderOptions = [
    { label: 'Masculino', value: 'male' },
    { label: 'Femenino', value: 'female' },
  ];

  registerForm: FormGroup = new FormGroup({});

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.registerForm = this.fb.group({
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
          this.alphanumericValidator(),
        ],
      ],
      confirmPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          this.alphanumericValidator(),
          this.matchValidator('password'),
        ],
      ],
    });

    this.registerForm.controls['password'].valueChanges.subscribe({
      next: () =>
        this.registerForm.controls['confirmPassword'].updateValueAndValidity(),
    });
  }

  matchValidator(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value
        ? null
        : { match: true };
    };
  }

  alphanumericValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regex = /^[a-zA-Z0-9]*$/;
      return regex.test(control.value) ? null : { alphanumeric: true };
    };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    const formValues = this.registerForm.value;

    if (
      !formValues.userName ||
      !formValues.email ||
      !formValues.knownAs ||
      !formValues.gender ||
      !formValues.birthDate ||
      !formValues.city ||
      !formValues.country ||
      !formValues.password ||
      !formValues.confirmPassword
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
      });
      return;
    }

    if (formValues.password !== formValues.confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Las contraseñas no coinciden',
      });
      return;
    }

    this.loading.set(true);

    const formattedDate = formValues.birthDate.toISOString().split('T')[0];

    const registerData: RegisterDto = {
      userName: formValues.userName,
      email: formValues.email,
      knownAs: formValues.knownAs,
      gender: formValues.gender,
      birthDate: formattedDate,
      city: formValues.city,
      country: formValues.country,
      password: formValues.password,
      confirmPassword: formValues.confirmPassword,
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Registro exitoso. Por favor, inicia sesión.',
        });
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error.error || 'Error al registrarse',
        });
      },
    });
  }
}
