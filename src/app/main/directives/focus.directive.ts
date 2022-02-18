import { Directive, Input, EventEmitter, ElementRef, Inject, Renderer2 } from '@angular/core';
 
@Directive({
  selector: '[focus]'
})

export class FocusDirective {
  
  public inputType: string;
  @Input('focus') focusEvent: EventEmitter<boolean>;

  constructor(@Inject(ElementRef) public element: ElementRef, public renderer: Renderer2) {
  }
 
  ngOnInit() {
    if(this.focusEvent) {
      this.focusEvent.subscribe(event => {
        if(this.element.nativeElement) {
          this.inputType = this.element.nativeElement.type;
          if (this.inputType && this.inputType != "text") {
            this.element.nativeElement.type = "text";
          }
          this.setSelectionRange(this.element.nativeElement,0,999);
          this.element.nativeElement.focus();
        }
      });
    }
  }

  setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
      input.focus();
      input.setSelectionRange(selectionStart, selectionEnd);
    } else if (input.createTextRange) {
      let range = input.createTextRange();
      range.collapse(true);
      range.moveEnd('character', selectionEnd);
      range.moveStart('character', selectionStart);
      range.select();
    }
    if (this.element.nativeElement.type != this.inputType) {
      this.element.nativeElement.type = this.inputType;
    }
  }
}