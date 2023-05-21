import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
	name: 'removestar'
})
export class RemoveStarPipe implements PipeTransform {
	transform(value) {
		if (!value) {
			return '';
		}
		return value.replace(/[&/\\#,+()$~%.'":*?<>{}]/g, '');
	}
}
