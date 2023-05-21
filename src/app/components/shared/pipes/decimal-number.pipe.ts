import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
	name: 'isDecimalNumber'
})
export class IsDecimalNumberPipe implements PipeTransform {
	transform(value) {
		const numberFilter = new DecimalPipe('en-US');
		if (value && value.toString().indexOf('.') >= 0) {
			return numberFilter.transform(value, '2');
		} else {
			return value;
		}
	}
}
