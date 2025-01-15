// src/app/shared/validators/must-contain-digit.validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator to check if the control's value contains at least one digit.
 */
export function mustContainDigitValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = (control.value || '').trim();
    if (!value) {
      return null; // Let required validator handle empty values
    }

    const hasDigit = /\d/.test(value);
    return hasDigit ? null : { noDigit: true };
  };
}
