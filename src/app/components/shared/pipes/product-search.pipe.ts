import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'productSearch',
    pure: false
})
export class ProductSearchPipe implements PipeTransform {
    transform(items: any[], filter: string): any {
        if (!items || !filter) {
            return items;
        }
        // filter items array, items which match and return true will be
        // kept, false will be filtered out
        return items.filter(item => {
            return (item.ProductName?.toLowerCase().indexOf(filter.toLowerCase()) > -1)  ||  (item.Description?.toLowerCase().indexOf(filter.toLowerCase()) > -1) || (item.SKU?.toLowerCase().indexOf(filter.toLowerCase()) > -1 );
        });
    }
}
