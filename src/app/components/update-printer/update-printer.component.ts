import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Printer, PrinterType } from './../../models/printer';

import { PrinterService } from './../../services/printer.service';

@Component({
  selector: 'app-update-printer',
  templateUrl: './update-printer.component.html',
  styleUrls: ['./update-printer.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdatePrinterComponent implements OnInit {

  @Input() printer: Printer;
  public types: PrinterType[] = [PrinterType.Bar, PrinterType.Kitchen, PrinterType.Counter];
  public printerForm: FormGroup;
  public alertMessage: any;
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'name': '',
    'connectionURL': '',
    'type': ''
  };

  public validationMessages = {
    'name': {
      'required':       'Este campo es requerido.'
    },
    'connectionURL': {
      'required':       'Este campo es requerido.'
    },
    'type': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _printerService: PrinterService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    this.printerForm.setValue({
      '_id':this.printer._id,
      'name': this.printer.name,
      'origin': this.printer.origin,
      'connectionURL': this.printer.connectionURL,
      'type': this.printer.type
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.printerForm = this._fb.group({
      '_id': [this.printer._id, [
        ]
      ],
      'name': [this.printer.name, [
          Validators.required
        ]
      ],
      'origin': [this.printer.origin, [
        ]
      ],
      'connectionURL': [this.printer.name, [
          Validators.required
        ]
      ],
      'type': [this.printer.type, [
        Validators.required
      ]
      ],
    });

    this.printerForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
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

  public updatePrinter (): void {
    
    this.loading = true;
    this.printer = this.printerForm.value;
    this.saveChanges();
  }

  public saveChanges(): void {
    
  this._printerService.updatePrinter(this.printer).subscribe(
    result => {
      if (!result.printer) {
        this.alertMessage = result.message;
        this.alertConfig.type = 'danger';
      } else {
        this.printer = result.printer;
        this.alertConfig.type = 'success';
        this.alertMessage = "La impresora se ha actualizado con éxito.";
        this.activeModal.close('save_close');
      }
      this.loading = false;
    },
    error => {
      this.alertMessage = error._body;
      if(!this.alertMessage) {
          this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
      }
      this.loading = false;
    }
    );
  }
}