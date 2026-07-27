import { AbstractControl, ValidationErrors } from '@angular/forms';


export function dateRangeValidator(
    control: AbstractControl
): ValidationErrors | null {


    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;


    if (!startDate || !endDate) {
        return null;
    }


    if (new Date(endDate) < new Date(startDate)) {

        return {
            dateRangeInvalid: true
        };

    }


    return null;

}