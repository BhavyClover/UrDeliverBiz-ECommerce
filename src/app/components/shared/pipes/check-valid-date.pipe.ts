import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'checkValidDate'
})
export class CheckValidDatePipe implements PipeTransform {
    transform(value, format) {
        if (value) {
            const datePipe = new DatePipe('en-US');
            const date = ['1900-01-01', '0001-01-01'].indexOf((new Date(value).toISOString()).substring(0, 10)) > -1 ? (new Date(value).toISOString()).substring(0, 10) : new Date(value).toISOString();
            const checkDate = datePipe.transform(date, format);
            const nullDate = datePipe.transform('0001-01-01T00:00:00', format);
            const invalidDate = datePipe.transform('1900-01-01T00:00:00', format);
            const startDateCheck = (checkDate == nullDate) || (checkDate == invalidDate);
            if (!startDateCheck) {
                return checkDate;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
}
