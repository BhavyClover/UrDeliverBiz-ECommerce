import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'categoryFilter'
})
export class CategoryPipe implements PipeTransform {
    transform(items: any, filter: any): any {
        if (!items || !filter) {
            return items;
        }
        // filter items array, items which match and return true will be
        // kept, false will be filtered out
        if (filter.Category.toLowerCase() == 'all'){
            return items;
        }
        return items.filter(item => item.Category.toLowerCase() == filter.Category.toLowerCase());
    }

}
