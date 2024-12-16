import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, Input, HostListener } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { finalize } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { HasUnsavedChanges } from '../../../../../guards/prevent-unsaved-changes.guard';
import { ProfileForm } from '../../../../../interfaces/profile-form';
import { User } from '../../../../../interfaces/user';
import { UserUpdate } from '../../../../../interfaces/user-update';
import { UserService } from '../../../../../services/user.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CalendarModule,
    DropdownModule,
    InputTextModule,
    InputTextareaModule,
  ],
  templateUrl: './edit-profile.component.html',
})
export class EditProfileComponent implements OnInit, HasUnsavedChanges {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly debounceMilliseconds = environment.debounceMilliseconds;
  private formChanged = false;
  private originalProfileValues!: ProfileForm;

  @Input() user: User = {} as User;
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
  protected readonly genderOptions = [
    { label: 'Masculino', value: 'male' },
    { label: 'Femenino', value: 'female' },
  ];
  protected readonly maxDate = new Date();
  protected loading = false;

  ngOnInit(): void {
    this.initializeProfileForm();
  }

  hasUnsavedChanges(): boolean {
    if (!this.formChanged) return false;

    return this.hasProfileChanges();
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: BeforeUnloadEvent) {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
    }
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
}
