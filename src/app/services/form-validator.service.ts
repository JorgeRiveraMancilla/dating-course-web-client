import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormValidatorService {
  alphanumeric(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const regex = /^[a-zA-Z0-9]*$/;
      return regex.test(control.value) ? null : { alphanumeric: true };
    };
  }

  passwordMatch(controlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;

      const password = control.parent.get(controlName);
      if (!password) return null;

      return password.value === control.value ? null : { passwordMatch: true };
    };
  }

  ageRangeValidator(minAgeControl: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;

      const minAge = control.parent.get(minAgeControl);
      if (!minAge) return null;

      const maxAge = control.value;

      if (minAge.value && maxAge) {
        return minAge.value <= maxAge ? null : { ageRange: true };
      }

      return null;
    };
  }
}
