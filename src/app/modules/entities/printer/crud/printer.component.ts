import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ApiResponse, Printer, PrinterPrintIn } from '@types';

import { PrinterService } from '@core/services/printer.service';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PositionPrint, TypeFields } from '@types';

@Component({
  selector: 'app-printer',
  templateUrl: './printer.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FocusDirective, PipesModule, TranslateModule, ProgressbarModule],
})
export class PrinterComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
  public alertMessage: string = '';
  public userType: string;
  public printer: Printer;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public printerForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();

  public printsIn: PrinterPrintIn[] = [
    PrinterPrintIn.Counter,
    PrinterPrintIn.Kitchen,
    PrinterPrintIn.Bar,
    PrinterPrintIn.Label,
    PrinterPrintIn.Voucher,
  ];
  public positions: PositionPrint[] = [PositionPrint.Header, PositionPrint.Body, PositionPrint.Footer];
  public typeFields: TypeFields[] = [
    TypeFields.Field,
    TypeFields.Line,
    TypeFields.MovArticle,
    TypeFields.MovCash,
    TypeFields.MovCan,
  ];

  constructor(
    public _printerService: PrinterService,
    public _router: Router,
    public _fb: UntypedFormBuilder,
    private _toastService: ToastService
  ) {
    this.printerForm = this._fb.group({
      _id: ['', []],
      name: ['', [Validators.required]],
      pageWidth: [0, []],
      pageHigh: [0, []],
      labelWidth: [0, []],
      labelHigh: [0, []],
      printIn: [PrinterPrintIn.Counter, [Validators.required]],
      url: ['', []],
      orientation: ['p', []], // p = portrait, l = landscape
      row: [0, []],
      addPag: [0, []],
      fields: this._fb.array([]),
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    const printerId = pathUrl[4];
    this.operation = pathUrl[3];

    if (printerId) this.getPrinter(printerId);
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusEvent.complete();
  }

  // Getter para acceder fácilmente al FormArray de fields
  get fieldsArray(): UntypedFormArray {
    return this.printerForm.get('fields') as UntypedFormArray;
  }

  // Método para crear un FormGroup para un field
  private createFieldFormGroup(): UntypedFormGroup {
    return this._fb.group({
      type: ['', []],
      label: ['', []],
      value: ['', []],
      font: ['', []],
      fontType: ['', []],
      fontSize: [0, []],
      positionStartX: [0, []],
      positionStartY: [0, []],
      positionEndX: [0, []],
      positionEndY: [0, []],
      splitting: [0, []],
      colour: ['', []],
      position: ['', []],
    });
  }

  // Método para agregar un nuevo field
  public addField(): void {
    this.fieldsArray.push(this.createFieldFormGroup());
  }

  // Método para eliminar un field
  public removeField(index: number): void {
    this.fieldsArray.removeAt(index);
  }

  public setValueForm(): void {
    const values = {
      _id: this.printer?._id ?? '',
      name: this.printer?.name ?? '',
      pageWidth: this.printer?.pageWidth ?? 0,
      pageHigh: this.printer?.pageHigh ?? 0,
      labelWidth: this.printer?.labelWidth ?? 0,
      labelHigh: this.printer?.labelHigh ?? 0,
      printIn: this.printer?.printIn ?? PrinterPrintIn.Counter,
      url: this.printer?.url ?? '',
      orientation: this.printer?.orientation ?? 'p',
      row: this.printer?.row ?? 0,
      addPag: this.printer?.addPag ?? 0,
    };

    this.printerForm.patchValue(values);

    // Manejar los fields
    if (this.printer?.fields && this.printer.fields.length > 0) {
      // Limpiar el FormArray existente
      while (this.fieldsArray.length !== 0) {
        this.fieldsArray.removeAt(0);
      }

      // Agregar cada field al FormArray
      this.printer.fields.forEach((field) => {
        this.fieldsArray.push(
          this._fb.group({
            type: [field.type || '', []],
            value: [field.value || '', []],
            font: [field.font || '', []],
            fontType: [field.fontType || '', []],
            fontSize: [field.fontSize || 0, []],
            positionStartX: [field.positionStartX || 0, []],
            positionStartY: [field.positionStartY || 0, []],
            positionEndX: [field.positionEndX || 0, []],
            positionEndY: [field.positionEndY || 0, []],
            position: [field.position || '', []],
          })
        );
      });
    }
  }

  returnTo() {
    return this._router.navigate(['/entities/printers']);
  }

  public getPrinter(printerId: string) {
    this.loading = true;

    this._printerService
      .getById(printerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.printer = result.result;
          if (result.status == 200) this.setValueForm();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public handlePrinterOperation() {
    this.loading = true;
    this.printerForm.markAllAsTouched();
    if (this.printerForm.invalid) {
      this.loading = false;
      return;
    }

    this.printer = this.printerForm.value;

    switch (this.operation) {
      case 'add':
        this.savePrinter();
        break;
      case 'update':
        this.updatePrinter();
        break;
      case 'delete':
        this.deletePrinter();
        break;
      default:
        break;
    }
  }

  public savePrinter() {
    this._printerService
      .save(this.printer)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public updatePrinter() {
    this._printerService
      .update(this.printer)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public deletePrinter() {
    this._printerService
      .delete(this.printer._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
