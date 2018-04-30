import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Printer, PrinterType, PrinterPrintIn } from './../../models/printer';

import { PrinterService } from './../../services/printer.service';

@Component({
  selector: 'app-add-printer',
  templateUrl: './add-printer.component.html',
  styleUrls: ['./add-printer.component.css'],
  providers: [NgbAlertConfig]
})

export class AddPrinterComponent implements OnInit {

  public printer: Printer;
  public types: PrinterType[] = [PrinterType.PDF];
  public printsIn: PrinterPrintIn[] = [PrinterPrintIn.Counter, PrinterPrintIn.Kitchen, PrinterPrintIn.Bar];
  public printerForm: FormGroup;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

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
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.printerForm = this._fb.group({
      'name': [this.printer.name, [
          Validators.required
        ] 
      ],
      'origin': [this.printer.origin, [
        ]
      ],
      'connectionURL': [this.printer.connectionURL, [
        ]
      ],
      'type': [this.printer.type, [
          Validators.required
        ]
      ],
      'printIn': [this.printer.printIn, [
        ]
      ]
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

  public addPrinter(): void {
    this.loading = true;
    this.printer = this.printerForm.value;
    this.savePrinter();
  }

  public savePrinter(): void {

    this.loading = true;

    this._printerService.savePrinter(this.printer).subscribe(
      result => {
        if (!result.printer) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.printer = result.printer;
          this.showMessage("La impresora se ha añadido con éxito.", "success", false);
          this.printer = new Printer();
          this.buildForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
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
    this.alertMessage = "";
  }
}