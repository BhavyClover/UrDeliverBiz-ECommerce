import {Directive, OnInit, Output, EventEmitter} from '@angular/core';

/*
Sample usage : <div *ngIf="condition" (ngInit)="initialize()">  ... </div>
*/

@Directive({
    selector: '[ngInit]'
})
export class NgInitDirective implements OnInit {

    @Output()
    ngInit: EventEmitter<any> = new EventEmitter();

    ngOnInit() {
        this.ngInit.emit();
    }
}
