import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
	name: 'unique'
})
export class UniquePipe implements PipeTransform {
	transform(collection, keyname) {
		const output = [];
		if (collection && collection.length > 0) {
			const keys = [];
			collection.forEach((item) => {
				const key = item[keyname];
				if (keys.indexOf(key) === -1) {
					keys.push(key);
					output.push(item);
				}
			});
		}
		return output;
	}
}
