import { AbstractControl, ValidationErrors } from '@angular/forms';


export function minDateValidator(
    control: AbstractControl
): ValidationErrors | null {


    const value = control.value;


    if (!value) {
        return null;
    }


    const selectedDate = new Date(value);


    const today = new Date();

    today.setHours(0, 0, 0, 0);


    if (selectedDate < today) {

        return {
            minDate: true
        };

    }


    return null;

}