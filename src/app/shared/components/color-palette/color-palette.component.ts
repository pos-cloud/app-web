import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, OnDestroy, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-color-palette',
  templateUrl: './color-palette.component.html',
  styleUrls: ['./color-palette.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPaletteComponent),
      multi: true,
    },
  ],
})
export class ColorPaletteComponent implements ControlValueAccessor, OnDestroy {
  @ViewChild('trigger') trigger: ElementRef<HTMLButtonElement>;
  @ViewChild('panel') panel: ElementRef<HTMLElement>;

  public open = false;
  public disabled = false;
  public hex = '#000000';
  public hexDraft = '#000000';
  public hue = 0;
  public saturation = 0;
  public value = 0;
  @Input() inputId = '';

  public top = 0;
  public left = 0;

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private scrollListener = () => {
    if (this.open) {
      this.place();
    }
  };

  constructor(private host: ElementRef<HTMLElement>) {
    document.addEventListener('scroll', this.scrollListener, true);
    window.addEventListener('resize', this.scrollListener);
  }

  ngOnDestroy(): void {
    document.removeEventListener('scroll', this.scrollListener, true);
    window.removeEventListener('resize', this.scrollListener);
    const node = this.panel?.nativeElement;
    if (node?.parentElement === document.body) {
      this.host.nativeElement.appendChild(node);
    }
  }

  writeValue(value: string): void {
    const next = this.normalizeHex(value) ?? '#000000';
    this.applyHex(next, false);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.open = false;
    }
  }

  get hueColor(): string {
    return `hsl(${this.hue}, 100%, 50%)`;
  }

  get svBackground(): string {
    return `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${this.hueColor})`;
  }

  toggle(event: Event): void {
    event.stopPropagation();
    if (this.disabled) {
      return;
    }
    this.open = !this.open;
    if (this.open) {
      this.attachPanel();
      this.place();
    }
    this.onTouched();
  }

  onPanelClick(event: Event): void {
    event.stopPropagation();
  }

  onSvPointer(event: PointerEvent, surface: HTMLElement): void {
    if (this.disabled) {
      return;
    }
    surface.setPointerCapture(event.pointerId);
    this.moveSv(event, surface);
  }

  onSvMove(event: PointerEvent, surface: HTMLElement): void {
    if (!surface.hasPointerCapture(event.pointerId)) {
      return;
    }
    this.moveSv(event, surface);
  }

  onHuePointer(event: PointerEvent, surface: HTMLElement): void {
    if (this.disabled) {
      return;
    }
    surface.setPointerCapture(event.pointerId);
    this.moveHue(event, surface);
  }

  onHueMove(event: PointerEvent, surface: HTMLElement): void {
    if (!surface.hasPointerCapture(event.pointerId)) {
      return;
    }
    this.moveHue(event, surface);
  }

  onHexInput(raw: string): void {
    this.hexDraft = raw.toUpperCase();
    const next = this.normalizeHex(raw);
    if (!next) {
      return;
    }
    const hsv = hexToHsv(next);
    this.hex = next;
    this.hue = hsv.h;
    this.saturation = hsv.s;
    this.value = hsv.v;
    this.onChange(this.hex);
  }

  copy(event: Event): void {
    event.stopPropagation();
    const text = this.hex.toUpperCase();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
  }

  @HostListener('document:click')
  close(): void {
    this.open = false;
  }

  private attachPanel(): void {
    const node = this.panel?.nativeElement;
    if (node && node.parentElement !== document.body) {
      document.body.appendChild(node);
    }
  }

  private place(): void {
    const rect = this.trigger?.nativeElement.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const panelWidth = 188;
    const panelHeight = 176;
    const gap = 6;
    const below = window.innerHeight - rect.bottom;
    this.top = below < panelHeight + gap ? Math.max(8, rect.top - panelHeight - gap) : rect.bottom + gap;
    this.left = Math.min(Math.max(8, rect.left), window.innerWidth - panelWidth - 8);
  }

  private moveSv(event: PointerEvent, surface: HTMLElement): void {
    const rect = surface.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);
    this.saturation = rect.width ? x / rect.width : 0;
    this.value = rect.height ? 1 - y / rect.height : 0;
    this.commit();
  }

  private moveHue(event: PointerEvent, surface: HTMLElement): void {
    const rect = surface.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    this.hue = rect.width ? (x / rect.width) * 360 : 0;
    this.commit();
  }

  private commit(): void {
    this.hex = hsvToHex(this.hue, this.saturation, this.value);
    this.hexDraft = this.hex.toUpperCase();
    this.onChange(this.hex);
  }

  private applyHex(hex: string, emit: boolean): void {
    const hsv = hexToHsv(hex);
    this.hex = hex;
    this.hexDraft = hex.toUpperCase();
    this.hue = hsv.h;
    this.saturation = hsv.s;
    this.value = hsv.v;
    if (emit) {
      this.onChange(this.hex);
    }
  }

  private normalizeHex(value: string): string | null {
    const raw = (value ?? '').trim().replace('#', '');
    if (!/^[\da-fA-F]{6}$/.test(raw) && !/^[\da-fA-F]{3}$/.test(raw)) {
      return null;
    }
    const full =
      raw.length === 3
        ? raw
            .split('')
            .map((char) => char + char)
            .join('')
        : raw;
    return `#${full.toLowerCase()}`;
  }
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h *= 60;
    if (h < 0) {
      h += 360;
    }
  }
  return { h, s: max === 0 ? 0 : delta / max, v: max };
}

function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  const channel = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}
