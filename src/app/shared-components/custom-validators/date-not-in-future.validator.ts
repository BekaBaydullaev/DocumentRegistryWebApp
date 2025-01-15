import { AbstractControl, ValidationErrors } from '@angular/forms';

export function dateNotInFutureValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  const inputDate = new Date(control.value);
  const today = new Date();
  
  // Reset time parts for accurate date comparison
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);

  return inputDate > today ? { futureDate: true } : null;
}
