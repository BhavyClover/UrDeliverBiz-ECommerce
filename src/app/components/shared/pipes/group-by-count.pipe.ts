import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'groupByCount'
})
export class GroupByCountPipe implements PipeTransform {
    transform(value, count) {
        const result = {};
        if (value && value.length > 0) {
            if (!count) {
                count = 1;
            }
            let counter = 0;
            const length = value.length / count;
            for (let i = 0; i < length; i++) {
                result[counter] = value.slice(counter * count, (counter * count) + count);
                counter++;
            }
        }
        return result;
    }
}
