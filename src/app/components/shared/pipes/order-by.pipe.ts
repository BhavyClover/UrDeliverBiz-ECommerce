import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'productOrderBy'
})
export class ProductOrderByPipe implements PipeTransform {
  transform(array, val: any) {

    if (!val) {
      return array;
    }

    // ascending
    if (val.sorttype == 'desc') {
      return Array.from(array).sort((item1: any, item2: any) => {
        return this.orderByComparator(item1[val.sortby], item2[val.sortby]);
      });
    } else if (val.sorttype == 'asc') { // desc
      return Array.from(array).sort((item1: any, item2: any) => {
        return this.orderByComparator(item2[val.sortby], item1[val.sortby]);
      });
    }

  }

  orderByComparator(a: any, b: any): number {
    if ((isNaN(parseFloat(a)) || !isFinite(a)) || (isNaN(parseFloat(b)) || !isFinite(b))) {
      // Isn't a number so lowercase the string to properly compare
      if (a.toLowerCase() < b.toLowerCase()) { return -1; }
      if (a.toLowerCase() > b.toLowerCase()) { return 1; }
    }
    else {
      // Parse strings as numbers to compare properly
      if (parseFloat(a) < parseFloat(b)) { return -1; }
      if (parseFloat(a) > parseFloat(b)) { return 1; }
    }
    return 0; // equal each other
  }

}
