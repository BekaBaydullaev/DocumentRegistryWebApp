import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator to ensure a date is not in the future.
 */
export function dateNotInFutureValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // If no date is provided, let other validators (e.g., required) handle it.
    }

    const selectedDate = new Date(value);
    const today = new Date();

    // Normalize today to remove the time part (set time to midnight)
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      return { dateInFuture: true }; // Error if the date is in the future
    }

    return null; // Valid date
  };
}
