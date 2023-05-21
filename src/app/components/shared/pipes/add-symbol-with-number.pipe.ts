import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
	name: 'addsymbolwithnumber'
})
export class AddSymbolWithNumberPipe implements PipeTransform {
	transform(value, symbol, lastdigitcount, symbolcount) {
		if (!value) {
			return '';
		}
		value = value.substring(value.length - lastdigitcount, value.length);
		const maskLength = symbolcount;
		let mask = '';
		for (let i = 0; i < maskLength; i++) {
			mask += symbol;
		}
		return mask + value;
	}
}
