import { Directive, ElementRef, HostListener, Input, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

/** Input `type="text"`: solo dígitos; en modo `decimal` un solo `.` o `,`. Actualiza `NgControl` al pegar. */
@Directive({
  standalone: true,
  selector: '[numericText]',
})
export class NumericTextDirective {
  @Input('numericText') mode: 'integer' | 'decimal' = 'decimal';

  constructor(
    private el: ElementRef<HTMLInputElement>,
    @Optional() @Self() private ngControl: NgControl | null
  ) {}

  private sanitize(raw: string): string {
    const v = raw.replace(/,/g, '.').replace(this.mode === 'integer' ? /\D/g : /[^\d.]/g, '');
    const i = this.mode === 'decimal' ? v.indexOf('.') : -1;
    return i < 0 ? v : `${v.slice(0, i + 1)}${v.slice(i + 1).replace(/\./g, '')}`;
  }

  private commitVisual(visual: string): void {
    const input = this.el.nativeElement;
    input.value = visual;
    const c = this.ngControl?.control;
    if (!c) {
      input.dispatchEvent(new InputEvent('input', { bubbles: true }));
      return;
    }
    let value: number | null = null;
    if (visual !== '' && visual !== '.') {
      const n = Number(visual.replace(',', '.'));
      value = Number.isNaN(n) ? null : n;
    }
    c.setValue(value, { emitEvent: true });
  }

  @HostListener('keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.ctrlKey || e.metaKey || e.key.length !== 1) return;
    const k = e.key;
    if (this.mode === 'decimal' && (k === '.' || k === ',')) {
      if (this.el.nativeElement.value.replace(',', '.').includes('.')) e.preventDefault();
      return;
    }
    if (!/\d/.test(k)) e.preventDefault();
  }

  @HostListener('paste', ['$event'])
  onPaste(e: ClipboardEvent): void {
    e.preventDefault();
    const input = this.el.nativeElement;
    const a = input.selectionStart ?? 0;
    const b = input.selectionEnd ?? 0;
    const chunk = this.sanitize(e.clipboardData?.getData('text/plain') ?? '');
    const merged = this.sanitize(`${input.value.slice(0, a)}${chunk}${input.value.slice(b)}`);
    this.commitVisual(merged);
    const c = Math.min(a + chunk.length, merged.length);
    requestAnimationFrame(() => input.setSelectionRange(c, c));
  }
}
