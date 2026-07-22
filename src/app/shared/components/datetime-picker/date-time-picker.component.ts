// https://stackblitz.com/edit/ng-bootstrap-datetimepicker
import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, forwardRef, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import {
  NgbDatepicker,
  NgbDatepickerModule,
  NgbDateStruct,
  NgbPopover,
  NgbPopoverConfig,
  NgbPopoverModule,
  NgbTimepickerModule,
  NgbTimeStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { noop } from 'rxjs';
import { DateTimeModel } from './date-time.model';

@Component({
  selector: 'app-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  providers: [
    DatePipe,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true,
    },
  ],
  imports: [CommonModule, FormsModule, NgbPopoverModule, NgbDatepickerModule, NgbTimepickerModule],
  standalone: true,
})
export class DateTimePickerComponent implements ControlValueAccessor, OnInit, AfterViewInit {
  @Input()
  dateString: string;

  @Input()
  inputDatetimeFormat = 'dd/MM/yyyy H:mm';
  @Input()
  hourStep = 1;
  @Input()
  minuteStep = 1;
  @Input()
  secondStep = 1;
  @Input()
  seconds = false;

  @Input()
  disabled = false;

  /**
   * Si es true, no notifica al formulario (ngModel) hasta que el usuario cierra el calendario.
   * Así puede elegir fecha, pasar al reloj, ajustar hora y recién ahí se dispara un solo cambio.
   */
  @Input()
  deferEmitUntilClose = false;

  private showTimePickerToggle = false;
  private pendingDirty = false;

  private datetime: DateTimeModel = new DateTimeModel();
  private firstTimeAssign = true;

  @ViewChild(NgbDatepicker)
  private dp: NgbDatepicker;

  @ViewChild(NgbPopover)
  private popover: NgbPopover;

  @ViewChild('dateTimeInput')
  private dateTimeInput: ElementRef;

  private onTouched: () => void = noop;
  private onChange: (_: any) => void = noop;

  private ngControl: NgControl;

  constructor(
    private config: NgbPopoverConfig,
    private inj: Injector
  ) {
    config.autoClose = 'outside';
    config.container = 'body';
    config.placement = ['bottom-left', 'bottom', 'bottom-right', 'top-left', 'top', 'top-right'];
  }

  ngOnInit(): void {
    this.ngControl = this.inj.get(NgControl);
  }

  ngAfterViewInit(): void {
    this.popover?.hidden?.subscribe(() => {
      this.showTimePickerToggle = false;
      if (this.deferEmitUntilClose && this.pendingDirty) {
        this.pendingDirty = false;
        this.onChange(this.dateString);
      }
    });
  }

  writeValue(newModel: string) {
    this.pendingDirty = false;
    if (newModel) {
      this.datetime = Object.assign(this.datetime, DateTimeModel.fromLocalString(newModel));
      this.dateString = newModel;
      this.setDateStringModel(true);
    } else {
      this.datetime = new DateTimeModel();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  toggleDateTimeState($event) {
    this.showTimePickerToggle = !this.showTimePickerToggle;
    $event.stopPropagation();
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange($event: any) {
    const value = ($event.target.value || '').trim();

    if (value === '') {
      this.datetime = new DateTimeModel();
      this.dateString = '';
      this.onChange(this.dateString);
      return;
    }

    const dt = DateTimeModel.fromLocalString(value) || DateTimeModel.fromDisplayString(value);

    if (dt) {
      this.datetime = dt;
      this.setDateStringModel();
    }
  }

  onDateChange($event: NgbDateStruct) {
    let newDate: string;
    if ($event.year) {
      newDate = `${$event.year}-${$event.month}-${$event.day}`;
    }

    const date = DateTimeModel.fromLocalString(newDate.toString());

    if (!date) {
      this.dateString = this.dateString;
      return;
    }

    if (!this.datetime) {
      this.datetime = date;
    }

    this.datetime.year = date.year;
    this.datetime.month = date.month;
    this.datetime.day = date.day;

    this.setDateStringModel();

    // Con deferEmitUntilClose el popover queda abierto para poder pasar al reloj sin disparar el guardado aún.
    const autoCloseAfterDate = !this.showTimePickerToggle && !this.deferEmitUntilClose;
    if (autoCloseAfterDate) {
      setTimeout(() => {
        this.closePopover();
      }, 100);
    }
  }

  onTimeChange(event: NgbTimeStruct) {
    this.datetime.hour = event.hour;
    this.datetime.minute = event.minute;
    this.datetime.second = event.second;

    this.setDateStringModel();
  }

  private closePopover() {
    if (this.popover) {
      this.popover.close();

      // Enfocar el input del datetime picker para mantener el foco en el form
      setTimeout(() => {
        if (this.dateTimeInput && this.dateTimeInput.nativeElement) {
          this.dateTimeInput.nativeElement.focus();
        }
        this.onTouched();
      }, 50);
    }
  }

  /** @param fromWriteValue evita marcar pendiente / notificar cuando el valor viene del padre (CVA). */
  setDateStringModel(fromWriteValue = false) {
    this.dateString = this.datetime.toString();

    if (!this.firstTimeAssign) {
      if (this.deferEmitUntilClose && !fromWriteValue) {
        this.pendingDirty = true;
      } else {
        this.onChange(this.dateString);
      }
    } else {
      // Skip very first assignment to null done by Angular
      if (this.dateString !== null) {
        this.firstTimeAssign = false;
      }
    }
  }

  inputBlur($event) {
    this.onTouched();
  }
}
