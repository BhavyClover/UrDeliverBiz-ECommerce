import { Directive, ElementRef, Renderer2, HostListener } from '@angular/core';
@Directive({
  selector: '[iconclass]'
})
export class IconClassDirective {
  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
  }
}

