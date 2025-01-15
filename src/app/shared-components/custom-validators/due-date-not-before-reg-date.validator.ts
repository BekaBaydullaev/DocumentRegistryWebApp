// src/app/shared/validators/due-date-not-before-reg-date.validator.ts

/**
 * Validator to ensure that dueDate is not before regDate.
 */
import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

export function dueDateNotBeforeRegDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    const regDate = formGroup.get('regDate')?.value;
    const dueDate = formGroup.get('dueDate')?.value;

    if (regDate && dueDate) {
      const reg = new Date(regDate);
      const due = new Date(dueDate);
      if (due < reg) {
        return { dueDateBeforeRegDate: true };
      }
    }
    return null;
  };
}
