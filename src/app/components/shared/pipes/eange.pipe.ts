import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'range'
})
export class RangePipe implements PipeTransform {
    transform(input, total) {
        const total1 = parseInt(total, input);
        for (let i = 0; i < total1; i++) {
            input.push(i);
        }
        return input;
    }
}
