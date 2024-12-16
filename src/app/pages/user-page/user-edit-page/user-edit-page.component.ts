import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TabViewModule } from 'primeng/tabview';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { PasswordModule } from 'primeng/password';
import { FileUploadModule } from 'primeng/fileupload';
import { finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../../../interfaces/user';
import { FormValidatorService } from '../../../services/form-validator.service';
import { UserService } from '../../../services/user.service';
import { HasUnsavedChanges } from '../../../guards/prevent-unsaved-changes.guard';
import { UserUpdate } from '../../../interfaces/user-update';
import { ProfileForm } from '../../../interfaces/profile-form';
import { ChangePasswordForm } from '../../../interfaces/change-password-form';

@Component({
  selector: 'app-user-edit-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    CalendarModule,
    DropdownModule,
    FileUploadModule,
    InputTextModule,
    InputTextareaModule,
    PasswordModule,
    TabViewModule,
  ],
  templateUrl: './user-edit-page.component.html',
})
export class UserEditPageComponent implements OnInit, HasUnsavedChanges {
  private readonly fb = inject(FormBuilder);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly validatorService = inject(FormValidatorService);

  protected user: User = {} as User;
  protected loading = false;
  protected activeTabIndex = 0;
  private readonly debounceMilliseconds = environment.debounceMilliseconds;

  private formChanged = false;
  private originalProfileValues!: ProfileForm;
  private originalPasswordValues!: ChangePasswordForm;

  protected readonly genderOptions = [
    { label: 'Masculino', value: 'male' },
    { label: 'Femenino', value: 'female' },
  ];
  protected readonly maxDate = new Date();

  protected readonly profileForm: FormGroup = this.fb.group({
    userName: ['', [Validators.required, Validators.minLength(3)]],
    knownAs: ['', [Validators.required, Validators.minLength(3)]],
    gender: ['', Validators.required],
    birthDate: [null as Date | null, Validators.required],
    city: ['', Validators.required],
    country: ['', Validators.required],
    introduction: [''],
    lookingFor: [''],
    interests: [''],
  });

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

  ngOnInit(): void {
    this.activatedRoute.data.subscribe({
      next: (data) => {
        if (data['user']) {
          this.user = data['user'];
        }
      },
      error: () => this.router.navigate(['/']),
    });

    this.initializeProfileForm();
    this.initializePasswordForm();
  }

  hasUnsavedChanges(): boolean {
    if (!this.formChanged) return false;

    return (
      this.hasProfileChanges() ||
      Object.keys(this.passwordForm.value).some(
        (key) => this.passwordForm.value[key] !== ''
      )
    );
  }

  protected hasProfileChanges(): boolean {
    const currentValues = this.profileForm.value;
    return Object.keys(this.originalProfileValues).some((key) => {
      if (key === 'birthDate') {
        const originalDate = this.originalProfileValues[key];
        const currentDate = currentValues[key];
        return originalDate.getTime() !== currentDate.getTime();
      }
      return this.originalProfileValues[key] !== currentValues[key];
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: BeforeUnloadEvent) {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
    }
  }

  private initializeProfileForm(): void {
    const [year, month, day] = this.user.birthDate.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);

    const formValues = {
      userName: this.user.userName,
      knownAs: this.user.knownAs,
      gender: this.user.gender,
      birthDate: birthDate,
      city: this.user.city,
      country: this.user.country,
      introduction: this.user.introduction,
      lookingFor: this.user.lookingFor,
      interests: this.user.interests,
    };

    this.profileForm.patchValue(formValues);
    this.originalProfileValues = formValues;

    this.profileForm.valueChanges.subscribe(() => {
      this.formChanged = this.hasProfileChanges();
    });
  }

  private initializePasswordForm(): void {
    this.originalPasswordValues = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    } as ChangePasswordForm;

    this.passwordForm.controls['newPassword'].valueChanges.subscribe(() => {
      this.passwordForm.controls['confirmPassword'].updateValueAndValidity();
    });

    this.passwordForm.valueChanges.subscribe(() => {
      const hasChanges = Object.keys(this.passwordForm.value).some(
        (key) => this.passwordForm.value[key] !== ''
      );
      this.formChanged = hasChanges;
    });
  }

  protected onProfileSubmit(): void {
    if (this.profileForm.invalid || !this.hasProfileChanges()) return;

    this.loading = true;
    const formValue = this.profileForm.value;
    const updatedUser: UserUpdate = {
      ...formValue,
      birthDate: formValue.birthDate.toISOString().split('T')[0],
    };

    this.userService
      .updateUser(this.user.id, updatedUser)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.formChanged = false;
          this.originalProfileValues = this.profileForm.value;
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Perfil actualizado correctamente',
            life: this.debounceMilliseconds,
          });
        },
        error: (error: HttpErrorResponse) =>
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.error || 'Error al actualizar el perfil',
            life: this.debounceMilliseconds,
          }),
      });
  }

  protected onPasswordSubmit(): void {
    if (this.passwordForm.invalid) return;

    this.loading = true;
    // const passwordData = this.passwordForm.value;

    // this.userService
    //   .changePassword(this.user.id, passwordData)
    //   .pipe(finalize(() => (this.loading = false)))
    //   .subscribe({
    //     next: () => {
    //       this.formChanged = false;
    //       this.passwordForm.reset();
    //       this.messageService.add({
    //         severity: 'success',
    //         summary: 'Éxito',
    //         detail:
    //           'Contraseña actualizada correctamente. Por favor, inicia sesión nuevamente.',
    //         life: this.debounceMilliseconds,
    //       });
    //       this.authService.logout();
    //       this.router.navigate(['/']);
    //     },
    //     error: (error: HttpErrorResponse) =>
    //       this.messageService.add({
    //         severity: 'error',
    //         summary: 'Error',
    //         detail: error.error?.error || 'Error al actualizar la contraseña',
    //         life: this.debounceMilliseconds,
    //       }),
    //   });
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
}
