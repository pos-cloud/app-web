import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbModal, NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { TransactionService } from './../../services/transaction.service';

@Component({
  selector: 'app-export-rece',
  templateUrl: './export-rece.component.html',
  styleUrls: ['./export-rece.component.css'],
  providers: [NgbAlertConfig]
})
export class ExportReceComponent implements OnInit {


  public exportReceForm: FormGroup;
  public alertMessage: string = "";
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public modelToImport: Array<String>;
  public months = ["01", "02", "03", "04", "05", "06", "07", "08", "09","10","11","12"];

  public formErrors = {
    'destination': '',
    'month': '',
    'year' : '',
    'pointofsale': ''
  };

  public validationMessages = {
    'destination' : {
      'required':     'Este campo es requerido.',
      'pattern' :     'El archivo debe terminar en .txt'
    },
    'month' : {
      'required':     'Este campo es requerido.'
    },
    'year' : {
      'required':     'Este campo es requerido.',
      'minlength':      'El año debe contener 4 digitos.',
      'maxlength':      'El año debe contener 4 digitos.',
    },
    'pointofsale' : {
      'required':     'Este campo es requerido',
      'minlength':      'El punto de venta debe contener 4 digitos.',
      'maxlength':      'El punto de venta debe contener 4 digitos.',
    }
  };


  constructor(
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _serviceTransaction: TransactionService
  ) { }

  ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.buildForm();
  }

  public buildForm(): void {
    this.exportReceForm = this._fb.group({
      'destination': ["C:/temp/nombre-archivo.txt", [
        Validators.required,
        Validators.pattern(".*\.txt"),
        ]
      ],
      'month': [moment().format("MM"), [
        Validators.required
        ]
      ],
      'year': [moment().format("YYYY"), [
        Validators.required,
        Validators.maxLength(4),
        Validators.minLength(4),
        ]
      ],
      'pointofsale':[, [
        Validators.required,
        Validators.maxLength(4),
        Validators.minLength(4),
        ]
      ],
    });
    this.exportReceForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {
    
    if (!this.exportReceForm) { return; }
    const form = this.exportReceForm;

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

  public exportRece(): void {
    
    this.loading = true;
    this.modelToImport = this.exportReceForm.value;
    this._serviceTransaction.getFileAfip(this.modelToImport).subscribe(
    result => {
        if (result.message !== "OK") {
          this.showMessage(result.message, "info", true); 
          this.loading = false;
        } else {
          this.showMessage("El archivo se genero correctamente.", "success", false);
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
