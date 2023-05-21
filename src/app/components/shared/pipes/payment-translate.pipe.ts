import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
@Pipe({
    name: 'paymentTranslate'
})
export class PaymentTranslatePipe implements PipeTransform {
    constructor(public translate: TranslateService, private sanitizer: DomSanitizer) { }
    transform(key, defaultValue) {
        try {
            if (key) {
                key = 'payment_method_' + (typeof key === 'string' ? key.replace(/[&/\\#,+()$~%.'":*?<>{}\s]/g, '') : key).toLowerCase();
                const translated = this.translate.instant(key);
                if (_.isEqual(translated, key) || translated === '') {
                    return this.sanitizer.bypassSecurityTrustHtml(defaultValue);
                } else {
                    return this.sanitizer.bypassSecurityTrustHtml(translated);
                }
            }
        } catch (ex) {
            return this.translate.instant(key);
        }
    }
}
