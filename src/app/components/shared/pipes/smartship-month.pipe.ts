import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
	name: 'translateSmartshipmonth'
})

export class TranslateSmartShipMonthPipe implements PipeTransform {
	constructor(public translate: TranslateService) { }
	transform(value) {
		if (typeof value !== 'string') {
			return '';
		}
		const s = value.split(' ');
		s[1] = this.translate.instant(s[1]);
		return s.join(' ');
	}
}
