import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
@Pipe({
	name: 'changedateformat'
})
export class ChangeDateFormatPipe implements PipeTransform {
	transform(value) {
		return moment(value).format('DD MMMM YYYY');
	}
}
