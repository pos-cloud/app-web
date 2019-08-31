import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Printer, PrinterType, PrinterPrintIn } from '../../models/printer';

import { PrinterService } from '../../services/printer.service';

@Component({
  selector: 'app-add-printer',
  templateUrl: './printer.component.html',
  styleUrls: ['./printer.component.css'],
  providers: [NgbAlertConfig]
})

export class PrinterComponent implements OnInit {

  @Input() printerId : string;
  @Input() readonly : boolean;
  @Input() operation : string;
  public printer: Printer;
  public types: PrinterType[] = [PrinterType.PDF];
  public printsIn: PrinterPrintIn[] = [PrinterPrintIn.Counter, PrinterPrintIn.Kitchen, PrinterPrintIn.Bar, PrinterPrintIn.Label];
  public printerForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public pageSizes: string[] = ["A4", "Etiqueta", "Roll Paper", "Personalizado"];

  public formErrors = {
    'name': '',
    'connectionURL': '',
    'type': '',
    'printIn': ''
  };

  public validationMessages = {
    'name': {
      'required': 'Este campo es requerido.'
    },
    'connectionURL': {
    },
    'type': {
      'required': 'Este campo es requerido.'
    },
    'printIn': {
    }
  };

  constructor(
    public _printerService: PrinterService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.printer = new Printer();
    this.buildForm();
    this.updatePageSize();

    if (this.printerId) {
      this.getPrinter();
    }
  }

  public getPrinter() : void {
    
    this._printerService.getPrinter(this.printerId).subscribe(
      result => {
        if (!result.printer) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.printer = result.printer;
          this.setValueForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.printerForm = this._fb.group({
      '_id': [this.printer._id, []],
      'name': [this.printer.name, [
          Validators.required
        ] 
      ],
      'type': [this.printer.type, [
          Validators.required
        ]
      ],
      'pageWidth': [this.printer.pageWidth, [
        ]
      ],
      'pageHigh': [this.printer.pageHigh, [
        ]
      ],
      'printIn': [this.printer.printIn, [
        ]
      ],
      'pageSize': [this.pageSizes[0], [
        ]
      ],
      'orientation' : [this.printer.orientation,[]],
      'row' : [this.printer.row,[]],
      'addPag' : [this.printer.addPag,[]]
    });

    this.printerForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.printerForm) { return; }
    const form = this.printerForm;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  public updatePageSize(): void {
    
    switch (this.printerForm.value.pageSize) {
      case "A4":
        this.printer.pageWidth = 210;
        this.printer.pageHigh = 297;
        break;
      case "Roll Paper":
        this.printer.pageWidth = 80;
        this.printer.pageHigh = 297; 
        break;
      case "Etiqueta":
        this.printer.pageWidth = 29;
        this.printer.pageHigh = 62;
        break;
      case "Personalizado":
        this.printer.pageWidth = 0;
        this.printer.pageHigh = 0;
        break;
    }

    this.printer.name = this.printerForm.value.name;
    this.printer.type = this.printerForm.value.type;
    this.printer.printIn = this.printerForm.value.printIn;

    this.setValueForm();
  }

  public setValueForm(): void {

    if (!this.printer._id) this.printer._id = '';
    if (!this.printer.name) this.printer.name = '';
    if (!this.printer.type) this.printer.type = PrinterType.PDF;
    if (!this.printer.pageWidth) this.printer.pageWidth = 0;
    if (!this.printer.pageHigh) this.printer.pageHigh = 0;
    if (!this.printer.printIn) this.printer.printIn = PrinterPrintIn.Counter;
    if (!this.printer.orientation) this.printer.orientation = '';
    if (!this.printer.row) this.printer.row = 0;
    if (!this.printer.addPag) this.printer.addPag = 0;

    this.printerForm.setValue({
      '_id' : this.printer._id,
      'name': this.printer.name,
      'type': this.printer.type,
      'pageWidth': this.printer.pageWidth,
      'pageHigh': this.printer.pageHigh,
      'printIn': this.printer.printIn,
      'pageSize': this.printerForm.value.pageSize,
      'orientation' : this.printer.orientation,
      'row' : this.printer.row,
      'addPag' : this.printer.addPag
    });
  }

  public addPrinter(): void {
    
    switch (this.operation) {
      case 'add':
        this.savePrinter();
        break;
      case 'update':
        this.updatePrinter();
        break;
      case 'delete' :
        this.deletePrinter();
      default:
        break;
    }
  }

  public savePrinter(): void {

    this.loading = true;
    this.printer = this.printerForm.value;

    this._printerService.savePrinter(this.printer).subscribe(
      result => {
        if (!result.printer) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.printer = result.printer;
          this.showMessage("La impresora se ha añadido con éxito.", 'success', false);
          this.printer = new Printer();
          this.buildForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updatePrinter() : void {
    
    this.loading = true;
    this.printer = this.printerForm.value;

    this._printerService.updatePrinter(this.printer).subscribe(
      result => {
        if (!result.printer) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.showMessage("La impresora se ha actualizado con éxito.", 'success', false);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deletePrinter() : void {

    this.loading = true;
    this._printerService.deletePrinter(this.printer._id).subscribe(
      result => {
        this.activeModal.close('close');
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );

  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}