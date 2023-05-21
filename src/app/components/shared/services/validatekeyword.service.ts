

import { Injectable } from '@angular/core';
import * as _ from 'lodash';


@Injectable({
    providedIn: 'root'
})
export class ValidateKeywordService {

    thisobj: any = {};
    WordsObject: any = {};
    arr: any = [];
    constructor() {}

    searchStringInArray(str, strArray) {
        try {
            const wordlist = str.split(' ');

            for (const val of strArray) {
                if (val) {
                    const strg = val.toLowerCase().trim();
                    const re = new RegExp('(^|\\+|\\W)' + strg.toString() + '($|\\+|\\W)');
                    if (str.toLowerCase().match(re) || val === str) {
                        this.arr.push(val);
                        this.WordsObject = {
                            key: this.arr
                        };
                        break;
                    }
                    else {
                        for (const val1 of wordlist) {
                            if (strg === val1) {
                                this.arr.push(val);
                                this.WordsObject = {
                                    key: this.arr
                                };
                                break;
                            }
                        }
                    }
                }
            }
        }
        catch (ex) {
            console.warn(ex);
        }
    }

    CheckValidation(array, text) {
        this.WordsObject = {};
        this.arr = [];
        if (array && text) {
            this.searchStringInArray(text, array);
        }
        if (this.arr.length > 0) {
            this.WordsObject.isvalid = false;
            return this.WordsObject;
        }
        else {
            this.WordsObject.key = [];
            this.WordsObject.isvalid = true;
            return this.WordsObject;
        }
    }

}
