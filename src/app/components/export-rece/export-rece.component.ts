import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbModal, NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

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

  public formErrors = {
    'destination': '',
    'period': ''
  };

  public validationMessages = {
    'destination' : {
      'required':     'Este campo es requerido.'
    },
    'period' : {
      'required':     'Este campo es requerido.'
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
    this.exportReceForm.setValue({
      'destination': "",
      'period': ""
    });
  }

  public buildForm(): void {
    this.exportReceForm = this._fb.group({
      'destination': "",
      'period': ""
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
        if (!result) {
          this.showMessage(result.message, "info", true); 
          this.loading = false;
        } else {
          this.showMessage("El archivo se genero correctamente.", "success", false);
          this.activeModal.close('save_close');
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
