import {Directive, Input, EventEmitter, ElementRef, Renderer, Inject} from '@angular/core';
 
@Directive({
  selector: '[focus]'
})

export class FocusDirective {
  
  public inputType: string;
  @Input('focus') focusEvent: EventEmitter<boolean>;

  constructor(@Inject(ElementRef) public element: ElementRef, public renderer: Renderer) {
  }
 
  ngOnInit() {
    this.focusEvent.subscribe(event => {
      this.inputType = this.element.nativeElement.type;
      if(this.inputType != "text") {
        this.element.nativeElement.type = "text";
      }
      this.setSelectionRange(this.element.nativeElement,0,999);
      this.renderer.invokeElementMethod(this.element.nativeElement, 'focus', []);
    });
  }

  setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
      input.focus();
      input.setSelectionRange(selectionStart, selectionEnd);
    } else if (input.createTextRange) {
      var range = input.createTextRange();
      range.collapse(true);
      range.moveEnd('character', selectionEnd);
      range.moveStart('character', selectionStart);
      range.select();
    }
    if(this.element.nativeElement.type != this.inputType) {
      this.element.nativeElement.type = this.inputType;
    }
  }
}