import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, UntypedFormBuilder } from '@angular/forms';
import { PrinterService } from '@core/services/printer.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Printer, PrinterPrintIn } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';

@Component({
  selector: 'app-select-printer',
  templateUrl: './select-printer.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, PipesModule, TranslateModule],
})
export class SelectPrinterComponent implements OnInit {
  @Input() typePrinter: PrinterPrintIn;

  public printers: Printer[] = [];
  public printerSelected: Printer;
  public loading: boolean = false;

  constructor(
    public _fb: UntypedFormBuilder,
    public _printerService: PrinterService,
    public activeModal: NgbActiveModal,
    public _toast: ToastService
  ) {}

  ngOnInit() {
    this.getPrinter();
  }

  public getPrinter(): void {
    this.printers = new Array();
    this.loading = true;

    this._printerService
      .find({ project: {}, query: { operationType: { $ne: 'D' }, printIn: this.typePrinter } })
      .subscribe({
        next: (value) => {
          this.printers = value;
          this.printerSelected = this.printers[0];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
        complete() {
          this.loading = false;
        },
      });
  }

  public selectPrinter(): void {
    this.activeModal.close({
      data: this.printerSelected,
    });
  }
}
